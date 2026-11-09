"use client";

import { useTranslations } from "next-intl";
import type { Color, InventoryInput } from "@/interface/domain";
import { Button } from "../Button/Button";
import { Input } from "../Field/Field";
import styles from "./inventory-editor.module.scss";

export interface InventoryDraft extends Omit<InventoryInput, "quantity"> {
  key: string;
  quantity: number | "";
}

interface InventoryEditorProps {
  colors: Color[];
  rows: InventoryDraft[];
  onChange: (rows: InventoryDraft[]) => void;
  disabled?: boolean;
}

export function InventoryEditor({
  colors,
  rows,
  onChange,
  disabled = false,
}: InventoryEditorProps) {
  const t = useTranslations("inventory");
  const total = rows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);

  function update(key: string, values: Partial<InventoryDraft>) {
    onChange(rows.map((row) => row.key === key ? { ...row, ...values } : row));
  }

  return (
    <section className={styles.root} aria-label={t("title")}>
      <h3 className={styles.title}>{t("title")}</h3>
      <p className={styles.hint}>{t("sizeHint")}</p>
      {colors.length === 0 ? <p className={styles.hint}>{t("selectColors")}</p> : null}
      {colors.map((color) => {
        const variants = rows.filter((row) => row.color_id === color.id);

        return (
          <fieldset key={color.id} disabled={disabled} className={styles.color}>
            <legend className={styles.legend}>
              <i className={styles.swatch} style={{ background: color.hexcode }} aria-hidden="true" />
              {color.name}
            </legend>
            <div className={styles.rows}>
              {variants.map((row, index) => (
                <div className={styles.row} key={row.key}>
                  <Input
                    label={t("size")}
                    aria-label={t("sizeFor", { color: color.name, index: index + 1 })}
                    value={row.size ?? ""}
                    maxLength={120}
                    placeholder={t("noSize")}
                    readOnly={row.id !== undefined}
                    onChange={(event) => update(row.key, { size: event.target.value })}
                  />
                  <Input
                    label={t("quantity")}
                    aria-label={t("quantityFor", { color: color.name, index: index + 1 })}
                    type="number"
                    min={0}
                    max={2147483647}
                    step={1}
                    required
                    value={row.quantity}
                    onChange={(event) => update(row.key, {
                      quantity: event.target.value === "" ? "" : Number(event.target.value),
                    })}
                  />
                  <Button
                    variant="outline"
                    className={styles.removeButton}
                    disabled={variants.length === 1}
                    aria-label={t("removeFor", { color: color.name, index: index + 1 })}
                    onClick={() => onChange(rows.filter((item) => item.key !== row.key))}
                  >
                    {t("remove")}
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onChange([
                ...rows,
                { key: crypto.randomUUID(), color_id: color.id, size: "", quantity: 0 },
              ])}
            >
              {t("addSize")}
            </Button>
          </fieldset>
        );
      })}
      <p className={styles.total} aria-live="polite">{t("total", { count: total })}</p>
    </section>
  );
}
