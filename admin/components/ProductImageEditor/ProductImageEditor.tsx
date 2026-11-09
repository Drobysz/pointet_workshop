"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Save, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  Color,
  ProductImage,
  ProductImagePayload,
} from "@/interface/domain";
import {
  deleteProductImage,
  updateProductImage,
} from "@/queries";
import { Button } from "../Button/Button";
import { Input, Select } from "../Field/Field";
import styles from "./product-image-editor.module.scss";

interface ProductImageEditorProps {
  colors: Color[];
  disabled?: boolean;
  images: ProductImage[];
  onChanged: () => Promise<void>;
}

interface ProductImageRowProps {
  colors: Color[];
  disabled: boolean;
  image: ProductImage;
  onChanged: () => Promise<void>;
}

function createPayload(image: ProductImage): ProductImagePayload {
  return {
    color_id: image.color_id,
    name: image.name,
    sort_order: image.sort_order,
  };
}

function ProductImageRow({
  colors,
  disabled,
  image,
  onChanged,
}: ProductImageRowProps) {
  const t = useTranslations("goods.images");
  const common = useTranslations("common");
  const [draft, setDraft] = useState<ProductImagePayload>(() => createPayload(image));
  const [saved, setSaved] = useState<ProductImagePayload>(() => createPayload(image));
  const [error, setError] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const controlsDisabled = disabled || isWorking;

  async function handleSave() {
    if (!draft.name.trim() || !isDirty) {
      return;
    }

    setError("");
    setIsWorking(true);

    try {
      const response = await updateProductImage(image.id, {
        ...draft,
        name: draft.name.trim(),
      });
      const updated = createPayload(response.data);

      setDraft(updated);
      setSaved(updated);
      await onChanged();
    } catch {
      setError(t("updateError"));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleRemove() {
    setError("");
    setIsWorking(true);

    try {
      await deleteProductImage(image.id);
      await onChanged();
    } catch {
      setError(t("deleteError"));
      setIsRemoving(false);
      setIsWorking(false);
    }
  }

  return (
    <li className={styles.imageRow}>
      <div className={styles.preview}>
        {image.url ? (
          <Image
            src={image.url}
            alt={image.name}
            width={80}
            height={80}
            unoptimized
          />
        ) : (
          <ImageOff size={24} aria-hidden="true" />
        )}
      </div>

      <div className={styles.fields}>
        <Input
          label={t("name")}
          value={draft.name}
          maxLength={120}
          disabled={controlsDisabled}
          onChange={(event) => {
            setDraft((current) => ({ ...current, name: event.target.value }));
          }}
        />
        <Select
          label={t("assignedColor")}
          value={draft.color_id}
          disabled={controlsDisabled}
          onChange={(event) => {
            setDraft((current) => ({ ...current, color_id: Number(event.target.value) }));
          }}
        >
          {colors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </Select>
        <Input
          label={t("order")}
          type="number"
          min="0"
          max="65535"
          value={draft.sort_order}
          disabled={controlsDisabled}
          onChange={(event) => {
            setDraft((current) => ({ ...current, sort_order: Number(event.target.value) }));
          }}
        />
      </div>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      <div className={styles.rowActions}>
        {isRemoving ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={controlsDisabled}
              onClick={() => setIsRemoving(false)}
            >
              <X size={15} aria-hidden="true" />
              {common("cancel")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={controlsDisabled}
              onClick={() => void handleRemove()}
            >
              <Trash2 size={15} aria-hidden="true" />
              {t("confirmRemove")}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={controlsDisabled || !isDirty || !draft.name.trim()}
              onClick={() => void handleSave()}
            >
              <Save size={15} aria-hidden="true" />
              {t("saveImage")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={styles.removeButton}
              disabled={controlsDisabled}
              onClick={() => setIsRemoving(true)}
            >
              <Trash2 size={15} aria-hidden="true" />
              {t("removeImage")}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

export function ProductImageEditor({
  colors,
  disabled = false,
  images,
  onChanged,
}: ProductImageEditorProps) {
  const t = useTranslations("goods");

  return (
    <section className={styles.root} aria-labelledby="current-images-title">
      <div className={styles.heading}>
        <h3 id="current-images-title" className={styles.title}>
          {t("images.currentTitle")}
        </h3>
        <span className={styles.badge}>
          {t("imagesCount", { count: images.length })}
        </span>
      </div>

      {images.length ? (
        <ul className={styles.list}>
          {images.map((image) => (
            <ProductImageRow
              key={image.id}
              colors={colors}
              disabled={disabled}
              image={image}
              onChanged={onChanged}
            />
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{t("images.emptyCurrent")}</p>
      )}
    </section>
  );
}
