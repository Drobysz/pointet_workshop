"use client";

import { useTranslations } from "next-intl";
import type { Color, InventoryInput } from "@/interface/domain";
import styles from "./inventory-editor.module.scss";

export interface InventoryDraft extends Omit<InventoryInput, "quantity"> { key: string; quantity: number | "" }

export function InventoryEditor({ colors, rows, onChange, disabled = false }: {
  colors: Color[];
  rows: InventoryDraft[];
  onChange: (rows: InventoryDraft[]) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("inventory");
  const total = rows.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
  function update(key: string, values: Partial<InventoryDraft>) {
    onChange(rows.map((row) => row.key === key ? { ...row, ...values } : row));
  }
  return (
    <section className={styles.root} aria-label={t("title")}>
      <h3>{t("title")}</h3>
      <p>{t("sizeHint")}</p>
      {colors.length === 0 ? <p>{t("selectColors")}</p> : null}
      {colors.map((color) => {
        const variants = rows.filter((row) => row.color_id === color.id);
        return (
          <fieldset key={color.id} disabled={disabled} className={styles.color}>
            <legend>{color.name}</legend>
            <div className={styles.rows}>
              {variants.map((row, index) => (
                <div className={styles.row} key={row.key}>
                  <label>
                    {t("size")}
                    <input aria-label={t("sizeFor", { color: color.name, index: index + 1 })} value={row.size ?? ""} maxLength={120} placeholder={t("noSize")} readOnly={row.id !== undefined} onChange={(event) => update(row.key, { size: event.target.value })} />
                  </label>
                  <label>
                    {t("quantity")}
                    <input aria-label={t("quantityFor", { color: color.name, index: index + 1 })} type="number" min={0} max={2147483647} step={1} required value={row.quantity} onChange={(event) => update(row.key, { quantity: event.target.value === "" ? "" : Number(event.target.value) })} />
                  </label>
                  <button type="button" disabled={variants.length === 1} onClick={() => onChange(rows.filter((item) => item.key !== row.key))} aria-label={t("removeFor", { color: color.name, index: index + 1 })}>{t("remove")}</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onChange([...rows, { key: crypto.randomUUID(), color_id: color.id, size: "", quantity: 0 }])}>{t("addSize")}</button>
          </fieldset>
        );
      })}
      <p className={styles.total} aria-live="polite">{t("total", { count: total })}</p>
    </section>
  );
}
