"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import useSWR from "swr";
import { goodSchema } from "@/auth/FormSchemes";
import {
  Button,
  Input,
  Modal,
  Select,
  StatePanel,
  Textarea,
  TranslationFields,
} from "@/components";
import { ApiError } from "@/helpers";
import { InventoryEditor, type InventoryDraft } from "@/components/InventoryEditor/InventoryEditor";
import { ImageDropzone } from "@/components/ImageDropzone/ImageDropzone";
import { MarkerPicker, type SelectableMarker } from "@/components/MarkerPicker/MarkerPicker";
import { ProductImageEditor } from "@/components/ProductImageEditor/ProductImageEditor";
import type { Color, Good, GoodPayload, TranslationsPayload } from "@/interface/domain";
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

interface GoodFormProps extends GoodFormModalProps {
  onImagesChanged: () => Promise<void>;
}

interface PendingImage {
  id: string;
  file: File;
  url: string;
  colorId: number;
  colorName: string;
}

function getNumberArray(formData: FormData, field: string): number[] {
  return formData.getAll(field).map((value) => Number(value));
}

function buildGoodPayload(
  formData: FormData,
  inventory: InventoryDraft[],
  inventoryVersion: number | undefined,
  sourceLocale: string,
  translations: TranslationsPayload,
): GoodPayload | null {
  const formValues = {
    source_locale: sourceLocale,
    ...(Object.keys(translations).length > 0 && { translations }),
    name: formData.get("name"),
    brand: formData.get("brand"),
    category_id: formData.get("category_id"),
    subcategory_id: formData.get("subcategory_id"),
    price: formData.get("price"),
    weigh: formData.get("weigh"),
    inventory_version: inventoryVersion,
    inventory: inventory.map(({ id, color_id, size, quantity }) => ({ id, color_id, size, quantity })),
    description: formData.get("description"),
    visible: formData.get("visible") === "true",
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
  onImagesChanged,
}: GoodFormProps) {
  const t = useTranslations("goods");
  const common = useTranslations("common");
  const validation = useTranslations("validation");
  const inventoryText = useTranslations("inventory");
  const translationText = useTranslations("translations");
  const interfaceLocale = useLocale();
  const options = useSWR("catalog-form-options", getCatalogOptions);
  // New products are written in the administrator's interface language unless they say otherwise.
  const [sourceLocale, setSourceLocale] = useState(good?.source_locale ?? interfaceLocale);
  const [translationEdits, setTranslationEdits] = useState<TranslationsPayload>({});
  const [categoryId, setCategoryId] = useState(good?.category_id ?? 0);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(good?.visible ?? true);
  const [selectedColors, setSelectedColors] = useState<Color[]>(
    good?.colors ?? [],
  );
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectableMarker[]
  >(good?.materials ?? []);
  const [inventory, setInventory] = useState<InventoryDraft[]>(
    (good?.inventory ?? []).map((row) => ({ ...row, key: String(row.id) })),
  );
  const savedVersion = useRef<number | undefined>(good?.inventory_version);
  function changeColors(markers: SelectableMarker[]) {
    const colors = markers as Color[];
    setSelectedColors(colors);
    setInventory((previous) => {
      const kept = previous.filter((row) => {
        return colors.some((color) => color.id === row.color_id);
      });

      for (const color of colors) {
        const alreadySelected = kept.some((row) => {
          return row.color_id === color.id;
        });

        if (!alreadySelected) {
          kept.push({
            key: crypto.randomUUID(),
            color_id: color.id,
            size: null,
            quantity: 0,
          });
        }
      }

      return kept;
    });
  }
  const [uploadColor, setUploadColor] = useState(0);
  const [images, setImages] = useState<PendingImage[]>([]);
  const savedId = useRef<number | undefined>(good?.id);
  const uploadedIds = useRef(new Set<string>());
  const objectUrls = useRef(new Set<string>());
  useEffect(() => {
    const activeObjectUrls = objectUrls.current;

    return () => {
      activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);
  const activeColor = selectedColors.find((color) => {
    return color.id === uploadColor;
  }) ?? selectedColors[0];
  const currentImages = (good?.colors ?? []).flatMap((color) => {
    return (color.images ?? []).map((image) => ({
      ...image,
      color_id: image.color_id ?? color.id,
    }));
  });

  function removeImage(id: string) {
    const image = images.find((item) => item.id === id);

    if (image) {
      URL.revokeObjectURL(image.url);
      objectUrls.current.delete(image.url);
    }

    setImages((previous) => previous.filter((item) => item.id !== id));
  }

  function addImages(files: File[]) {
    if (!activeColor) {
      return;
    }

    const addedImages = files.map((file): PendingImage => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);

      return {
        id: crypto.randomUUID(),
        file,
        url,
        colorId: activeColor.id,
        colorName: activeColor.name,
      };
    });

    setImages((previous) => [...previous, ...addedImages]);
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSaving) {
      void handleSubmit(new FormData(event.currentTarget));
    }
  }

  if (options.isLoading) {
    return <StatePanel state="loading" compact />;
  }

  if (options.error || !options.data) {
    return (
      <StatePanel
        state="error"
        compact
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

    const payload = buildGoodPayload(
      formData,
      inventory,
      savedVersion.current,
      sourceLocale,
      translationEdits,
    );

    if (!payload) {
      setError(validation("checkForm"));
      return;
    }

    const hasImageWithoutSelectedColor = images.some((image) => {
      return !payload.inventory.some((row) => {
        return row.color_id === image.colorId;
      });
    });

    if (hasImageWithoutSelectedColor) {
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
      setTranslationEdits({});
      setInventory(result.data.inventory.map((row) => ({
        ...row,
        key: String(row.id),
      })));
      productSaved = true;
      for (const image of images) {
        if (uploadedIds.current.has(image.id)) {
          continue;
        }

        await uploadProductImage(savedId.current, image.colorId, image.file);
        uploadedIds.current.add(image.id);
        removeImage(image.id);
      }
      await onSaved();
      onClose();
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 409) {
        setError(inventoryText("conflict"));
      } else {
        const hasPendingUploads = images.some((image) => {
          return !uploadedIds.current.has(image.id);
        });
        const errorMessage = productSaved && hasPendingUploads
          ? t("images.retryError")
          : t("saveError");

        setError(errorMessage);
      }
    } finally {
      setIsSaving(false);
      onBusyChange?.(false);
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <fieldset disabled={isSaving} className={styles.formFields}>
        <div className={styles.grid}>
          <Input
            label={t("form.name")}
            name="name"
            defaultValue={good?.name ?? ""}
            maxLength={255}
            required
          />
          <Input
            label={t("form.brand")}
            name="brand"
            defaultValue={good?.brand ?? ""}
            maxLength={255}
            required
          />
          <Input
            label={t("form.price")}
            name="price"
            type="number"
            defaultValue={good?.price ?? ""}
            min="0"
            step="0.01"
            required
          />
          <Input
            label={t("form.weigh")}
            name="weigh"
            type="number"
            defaultValue={good?.weigh ?? 0}
            min="0"
            step="1"
            required
          />
          <Select
            label={t("form.category")}
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
          </Select>
          <Select
            label={t("form.subcategory")}
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
          </Select>
        </div>

        <TranslationFields
          kind="goods"
          entity={good}
          entityId={good?.id}
          sourceLocale={sourceLocale}
          onSourceLocaleChange={setSourceLocale}
          edits={translationEdits}
          onEditsChange={setTranslationEdits}
          disabled={isSaving}
          onRegenerated={good ? onImagesChanged : undefined}
        />

        <Textarea
          label={t("form.description")}
          hint={translationText("descriptionNotice")}
          name="description"
          defaultValue={good?.description ?? ""}
          required
        />

        <section className={styles.visibility}>
          <div className={styles.visibilityCopy}>
            <strong>{t("form.visibility")}</strong>
            <span>{t("form.visibilityDescription")}</span>
          </div>
          <input
            type="hidden"
            name="visible"
            value={String(isVisible)}
          />
          <Button
            variant={isVisible ? "outline" : "secondary"}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((current) => !current)}
          >
            {isVisible ? (
              <Eye size={17} aria-hidden="true" />
            ) : (
              <EyeOff size={17} aria-hidden="true" />
            )}
            {isVisible ? t("visible") : t("hidden")}
          </Button>
        </section>

        <MarkerPicker
          kind="colors"
          name="color_ids"
          label={t("form.colors")}
          selected={selectedColors}
          onChange={changeColors}
          disabled={isSaving}
        />
        <InventoryEditor
          colors={selectedColors}
          rows={inventory}
          onChange={setInventory}
          disabled={isSaving}
        />
        <MarkerPicker
          kind="materials"
          name="material_ids"
          label={t("form.materials")}
          selected={selectedMaterials}
          onChange={setSelectedMaterials}
          disabled={isSaving}
        />
        {good ? (
          <ProductImageEditor
            colors={good.colors}
            disabled={isSaving}
            images={currentImages}
            onChanged={onImagesChanged}
          />
        ) : null}
        <Select
          label={t("images.color")}
          hint={t("images.colorHint")}
          value={activeColor?.id ?? ""}
          onChange={(event) => setUploadColor(Number(event.target.value))}
          disabled={!selectedColors.length || isSaving}
        >
          {!selectedColors.length ? (
            <option value="">{t("images.selectColor")}</option>
          ) : null}
          {selectedColors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </Select>
        <ImageDropzone
          label={t("images.title")}
          multiple
          disabled={isSaving}
          disableSelection={!activeColor}
          images={images.map((image) => ({
            id: image.id,
            name: image.file.name,
            url: image.url,
            detail: image.colorName,
          }))}
          onRemove={removeImage}
          onFiles={addImages}
        />
      </fieldset>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      <div className={styles.actions}>
        <Button variant="secondary" disabled={isSaving} onClick={onClose}>
          {common("cancel")}
        </Button>
        <Button type="submit" variant="primary" pending={isSaving}>
          {isSaving ? common("saving") : common("save")}
        </Button>
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
    <Modal title={title} size="lg" onClose={() => { if (!busy) onClose(); }}>
      {good && detail.isLoading ? <StatePanel state="loading" compact /> : null}
      {good && detail.error ? (
        <StatePanel state="error" compact onRetry={() => void detail.mutate()} />
      ) : null}
      {!good || detail.data ? (
        <GoodForm
          good={formGood}
          onClose={onClose}
          onSaved={onSaved}
          onBusyChange={setBusy}
          onImagesChanged={async () => {
            await detail.mutate();
          }}
        />
      ) : null}
    </Modal>
  );
}
