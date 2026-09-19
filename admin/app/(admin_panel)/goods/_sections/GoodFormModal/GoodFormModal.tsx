"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { goodSchema } from "@/auth/FormSchemes";
import { Modal, StatePanel } from "@/components";
import { ApiError } from "@/helpers";
import { InventoryEditor, type InventoryDraft } from "@/components/InventoryEditor/InventoryEditor";
import { ImageDropzone } from "@/components/ImageDropzone/ImageDropzone";
import { MarkerPicker, type SelectableMarker } from "@/components/MarkerPicker/MarkerPicker";
import type { Color, Good, GoodPayload } from "@/interface/domain";
import {
  createGood,
  getCatalogOptions,
  getGood,
  updateGood,
  uploadProductImage,
} from "@/queries";
import styles from "@/components/FormModal/form-modal.module.scss";

interface GoodFormModalProps {
  good?: Good;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onBusyChange?: (busy: boolean) => void;
}

function getNumberArray(formData: FormData, field: string): number[] {
  return formData.getAll(field).map((value) => Number(value));
}

function buildGoodPayload(formData: FormData, inventory: InventoryDraft[], inventoryVersion?: number): GoodPayload | null {
  const formValues = {
    name: formData.get("name"),
    category_id: formData.get("category_id"),
    subcategory_id: formData.get("subcategory_id"),
    price: formData.get("price"),
    inventory_version: inventoryVersion,
    inventory: inventory.map(({ id, color_id, size, quantity }) => ({ id, color_id, size, quantity })),
    description: formData.get("description"),
    material_ids: getNumberArray(formData, "material_ids"),
  };
  const parsed = goodSchema.safeParse(formValues);

  return parsed.success ? parsed.data : null;
}

function GoodForm({
  good,
  onClose,
  onSaved,
  onBusyChange,
}: GoodFormModalProps) {
  const t = useTranslations("goods");
  const common = useTranslations("common");
  const validation = useTranslations("validation");
  const inventoryText = useTranslations("inventory");
  const options = useSWR("catalog-form-options", getCatalogOptions);
  const [categoryId, setCategoryId] = useState(good?.category_id ?? 0);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Color[]>(good?.colors ?? []);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectableMarker[]>(good?.materials ?? []);
  const [inventory, setInventory] = useState<InventoryDraft[]>(
    (good?.inventory ?? []).map((row) => ({ ...row, key: String(row.id) })),
  );
  const savedVersion = useRef<number | undefined>(good?.inventory_version);
  function changeColors(markers: SelectableMarker[]) {
    const colors = markers as Color[];
    setSelectedColors(colors);
    setInventory((previous) => {
      const kept = previous.filter((row) => colors.some((color) => color.id === row.color_id));
      for (const color of colors) {
        if (!kept.some((row) => row.color_id === color.id)) kept.push({ key: crypto.randomUUID(), color_id: color.id, size: null, quantity: 0 });
      }
      return kept;
    });
  }
  const [uploadColor, setUploadColor] = useState(0);
  const [images, setImages] = useState<{ id: string; file: File; url: string; colorId: number; colorName: string }[]>([]);
  const savedId = useRef<number | undefined>(good?.id);
  const uploadedIds = useRef(new Set<string>());
  const objectUrls = useRef(new Set<string>());
  useEffect(() => () => { objectUrls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);
  const activeColor = selectedColors.find((color) => color.id === uploadColor) ?? selectedColors[0];

  function removeImage(id: string) {
    const image = images.find((item) => item.id === id);
    if (image) { URL.revokeObjectURL(image.url); objectUrls.current.delete(image.url); }
    setImages((previous) => previous.filter((item) => item.id !== id));
  }


  if (options.isLoading) {
    return <StatePanel state="loading" />;
  }

  if (options.error || !options.data) {
    return (
      <StatePanel
        state="error"
        onRetry={() => void options.mutate()}
      />
    );
  }

  const selectedCategory = options.data.categories.find((category) => {
    return category.id === categoryId;
  });
  const subcategories = selectedCategory?.subcategories ?? [];
  async function handleSubmit(formData: FormData) {
    setError("");

    const payload = buildGoodPayload(formData, inventory, savedVersion.current);

    if (!payload) {
      setError(validation("checkForm"));
      return;
    }

    if (images.some((image) => !payload.inventory.some((row) => row.color_id === image.colorId))) {
      setError(t("images.colorError"));
      return;
    }
    setIsSaving(true);
    onBusyChange?.(true);
    let productSaved = false;

    try {
      const result = savedId.current
        ? await updateGood(savedId.current, payload)
        : await createGood(payload);
      savedId.current = result.data.id;
      savedVersion.current = result.data.inventory_version;
      setInventory(result.data.inventory.map((row) => ({ ...row, key: String(row.id) })));
      productSaved = true;
      for (const image of images) {
        if (uploadedIds.current.has(image.id)) continue;
        await uploadProductImage(savedId.current, image.colorId, image.file);
        uploadedIds.current.add(image.id);
        removeImage(image.id);
      }
      await onSaved();
      onClose();
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 409) {
        setError(inventoryText("conflict"));
      } else setError(productSaved && images.some((image) => !uploadedIds.current.has(image.id)) ? t("images.retryError") : t("saveError"));
    } finally {
      setIsSaving(false);
      onBusyChange?.(false);
    }
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); if (!isSaving) void handleSubmit(new FormData(event.currentTarget)); }} className={styles.form}>
      <fieldset disabled={isSaving} className={styles.formFields}>
      <div className={styles.grid}>
        <label className={styles.field}>
          {t("form.name")}
          <input
            name="name"
            defaultValue={good?.name ?? ""}
            maxLength={255}
            required
          />
        </label>

        <label className={styles.field}>
          {t("form.price")}
          <input
            name="price"
            type="number"
            defaultValue={good?.price ?? ""}
            min="0"
            step="0.01"
            required
          />
        </label>

        <label className={styles.field}>
          {t("form.category")}
          <select
            name="category_id"
            value={categoryId || ""}
            onChange={(event) => setCategoryId(Number(event.target.value))}
            required
          >
            <option value="" disabled>{t("form.selectCategory")}</option>
            {options.data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          {t("form.subcategory")}
          <select
            name="subcategory_id"
            defaultValue={good?.subcategory_id ?? ""}
            key={categoryId}
            required
          >
            <option value="" disabled>{t("form.selectSubcategory")}</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </label>

      </div>

      <label className={styles.field}>
        {t("form.description")}
        <textarea
          name="description"
          defaultValue={good?.description ?? ""}
          required
        />
      </label>

      <MarkerPicker kind="colors" name="color_ids" label={t("form.colors")} selected={selectedColors} onChange={changeColors} disabled={isSaving} />
      <InventoryEditor colors={selectedColors} rows={inventory} onChange={setInventory} disabled={isSaving} />
      <MarkerPicker kind="materials" name="material_ids" label={t("form.materials")} selected={selectedMaterials} onChange={setSelectedMaterials} disabled={isSaving} />
      <label className={styles.field}>
        {t("images.color")}
        <select value={activeColor?.id ?? ""} onChange={(event) => setUploadColor(Number(event.target.value))} disabled={!selectedColors.length || isSaving}>
          {!selectedColors.length ? <option value="">{t("images.selectColor")}</option> : null}
          {selectedColors.map((color) => <option key={color.id} value={color.id}>{color.name}</option>)}
        </select>
        <small>{t("images.colorHint")}</small>
      </label>
      <ImageDropzone
        label={t("images.title")} multiple disabled={isSaving} disableSelection={!activeColor}
        images={images.map((image) => ({ id: image.id, name: image.file.name, url: image.url, detail: image.colorName }))}
        onRemove={removeImage}
        onFiles={(files) => {
          if (!activeColor) return;
          const added = files.map((file) => {
            const url = URL.createObjectURL(file);
            objectUrls.current.add(url);
            return { id: crypto.randomUUID(), file, url, colorId: activeColor.id, colorName: activeColor.name };
          });
          setImages((previous) => [...previous, ...added]);
        }}
      />
      </fieldset>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      <div className={styles.actions}>
        <button type="button" disabled={isSaving} onClick={onClose}>{common("cancel")}</button>
        <button type="submit" disabled={isSaving}>
          {isSaving ? common("saving") : common("save")}
        </button>
      </div>
    </form>
  );
}

export function GoodFormModal({
  good,
  onClose,
  onSaved,
}: GoodFormModalProps) {
  const t = useTranslations("goods");
  const [busy, setBusy] = useState(false);
  const detail = useSWR(
    good ? ["good-form", good.id] as const : null,
    ([, goodId]) => getGood(goodId),
  );

  const formGood = detail.data?.data ?? good;
  const title = good ? t("editTitle") : t("createTitle");

  return (
    <Modal title={title} onClose={() => { if (!busy) onClose(); }}>
      {good && detail.isLoading ? <StatePanel state="loading" /> : null}
      {good && detail.error ? (
        <StatePanel state="error" onRetry={() => void detail.mutate()} />
      ) : null}
      {!good || detail.data ? (
        <GoodForm
          good={formGood}
          onClose={onClose}
          onSaved={onSaved}
          onBusyChange={setBusy}
        />
      ) : null}
    </Modal>
  );
}
