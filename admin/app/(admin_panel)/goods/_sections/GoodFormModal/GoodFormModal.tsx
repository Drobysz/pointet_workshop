"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { goodSchema } from "@/auth/FormSchemes";
import { Modal, StatePanel } from "@/components";
import type { Good, GoodPayload } from "@/interface/domain";
import {
  createGood,
  getCatalogOptions,
  getGood,
  updateGood,
} from "@/queries";
import styles from "@/components/FormModal/form-modal.module.scss";

interface GoodFormModalProps {
  good?: Good;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

function getNumberArray(formData: FormData, field: string): number[] {
  return formData.getAll(field).map((value) => Number(value));
}

function buildGoodPayload(formData: FormData): GoodPayload | null {
  const formValues = {
    name: formData.get("name"),
    category_id: formData.get("category_id"),
    subcategory_id: formData.get("subcategory_id"),
    price: formData.get("price"),
    current_quantity: formData.get("current_quantity"),
    description: formData.get("description"),
    color_ids: getNumberArray(formData, "color_ids"),
    material_ids: getNumberArray(formData, "material_ids"),
  };
  const parsed = goodSchema.safeParse(formValues);

  return parsed.success ? parsed.data : null;
}

function GoodForm({
  good,
  onClose,
  onSaved,
}: GoodFormModalProps) {
  const t = useTranslations("goods");
  const common = useTranslations("common");
  const validation = useTranslations("validation");
  const options = useSWR("catalog-form-options", getCatalogOptions);
  const [categoryId, setCategoryId] = useState(good?.category_id ?? 0);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
  const selectedColorIds = new Set(good?.colors.map((color) => color.id));
  const selectedMaterialIds = new Set(
    good?.materials?.map((material) => material.id),
  );

  async function handleSubmit(formData: FormData) {
    setError("");

    const payload = buildGoodPayload(formData);

    if (!payload) {
      setError(validation("checkForm"));
      return;
    }

    setIsSaving(true);

    try {
      if (good) {
        await updateGood(good.id, payload);
      } else {
        await createGood(payload);
      }

      await onSaved();
      onClose();
    } catch {
      setError(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form action={handleSubmit} className={styles.form}>
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

        <label className={styles.field}>
          {t("form.stock")}
          <input
            name="current_quantity"
            type="number"
            defaultValue={good?.current_quantity ?? 0}
            min="0"
            step="1"
            required
          />
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

      <fieldset className={styles.fieldset}>
        <legend>{t("form.colors")}</legend>
        <div className={styles.checks}>
          {options.data.colors.map((color) => (
            <label className={styles.check} key={color.id}>
              <input
                name="color_ids"
                type="checkbox"
                value={color.id}
                defaultChecked={selectedColorIds.has(color.id)}
              />
              <i
                className={styles.swatch}
                style={{ backgroundColor: color.hexcode }}
              />
              {color.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>{t("form.materials")}</legend>
        <div className={styles.checks}>
          {options.data.materials.map((material) => (
            <label className={styles.check} key={material.id}>
              <input
                name="material_ids"
                type="checkbox"
                value={material.id}
                defaultChecked={selectedMaterialIds.has(material.id)}
              />
              {material.name}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      <div className={styles.actions}>
        <button type="button" onClick={onClose}>{common("cancel")}</button>
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
  const detail = useSWR(
    good ? ["good-form", good.id] as const : null,
    ([, goodId]) => getGood(goodId),
  );

  const formGood = detail.data?.data ?? good;
  const title = good ? t("editTitle") : t("createTitle");

  return (
    <Modal title={title} onClose={onClose}>
      {good && detail.isLoading ? <StatePanel state="loading" /> : null}
      {good && detail.error ? (
        <StatePanel state="error" onRetry={() => void detail.mutate()} />
      ) : null}
      {!good || detail.data ? (
        <GoodForm
          good={formGood}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
}
