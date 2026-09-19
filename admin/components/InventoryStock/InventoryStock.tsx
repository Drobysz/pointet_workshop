"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ApiEntity, Good } from "@/interface/domain";
import { restockInventory } from "@/queries";
import styles from "./inventory-stock.module.scss";

export function InventoryStock({ product, onUpdated }: { product: Good; onUpdated: (result: ApiEntity<Good>) => Promise<void> }) {
  const t = useTranslations("inventory");
  const [busy, setBusy] = useState<number>();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const submitting = useRef(false);

  return (
    <section className={styles.root} aria-label={t("title")}>
      <h2>{t("title")}</h2>
      <p>{t("restockHint")}</p>
      <div className={styles.rows}>
        {product.inventory.map((row) => {
          const color = product.colors.find((item) => item.id === row.color_id)?.name ?? String(row.color_id);
          const label = `${color} · ${row.size ?? t("noSize")}`;
          return (
            <form className={styles.row} key={row.id} onSubmit={async (event) => {
              event.preventDefault();
              if (submitting.current) return;
              const form = event.currentTarget;
              const quantity = Number(new FormData(form).get("quantity"));
              if (!Number.isInteger(quantity) || quantity < 1 || quantity > 2147483647) return;
              submitting.current = true; setBusy(row.id); setMessage(""); setFailed(false);
              try {
                const result = await restockInventory(product.id, row.id, quantity);
                form.reset();
                setMessage(t("added", { count: quantity, variant: label }));
                await onUpdated(result);
              } catch { setFailed(true); setMessage(t("restockError")); }
              finally { submitting.current = false; setBusy(undefined); }
            }}>
              <div><strong>{label}</strong><span>{t("available", { count: row.quantity })}</span></div>
              <label>{t("arriving")}<input name="quantity" type="number" min={1} max={2147483647} step={1} required disabled={busy !== undefined} aria-label={t("addFor", { variant: label })} /></label>
              <button type="submit" disabled={busy !== undefined}>{busy === row.id ? t("saving") : t("addStock")}</button>
            </form>
          );
        })}
      </div>
      {message ? <p role={failed ? "alert" : "status"}>{message}</p> : null}
    </section>
  );
}
