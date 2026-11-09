"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ApiEntity, Good } from "@/interface/domain";
import { restockInventory } from "@/queries";
import { Button } from "../Button/Button";
import { Input } from "../Field/Field";
import { Panel, PanelHeader } from "../Panel/Panel";
import styles from "./inventory-stock.module.scss";

interface InventoryStockProps {
  product: Good;
  onUpdated: (result: ApiEntity<Good>) => Promise<void>;
}

export function InventoryStock({ product, onUpdated }: InventoryStockProps) {
  const t = useTranslations("inventory");
  const [busy, setBusy] = useState<number>();
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const submitting = useRef(false);

  return (
    <Panel className={styles.root} aria-label={t("title")}>
      <PanelHeader title={t("title")} description={t("restockHint")} />
      <div className={styles.rows}>
        {product.inventory.map((row) => {
          const color = product.colors.find((item) => item.id === row.color_id)?.name
            ?? String(row.color_id);
          const label = `${color} · ${row.size ?? t("noSize")}`;

          return (
            <form
              className={styles.row}
              key={row.id}
              onSubmit={async (event) => {
                event.preventDefault();
                if (submitting.current) return;
                const form = event.currentTarget;
                const quantity = Number(new FormData(form).get("quantity"));
                if (!Number.isInteger(quantity) || quantity < 1 || quantity > 2147483647) return;
                submitting.current = true;
                setBusy(row.id);
                setMessage("");
                setFailed(false);
                try {
                  const result = await restockInventory(product.id, row.id, quantity);
                  form.reset();
                  setMessage(t("added", { count: quantity, variant: label }));
                  await onUpdated(result);
                } catch {
                  setFailed(true);
                  setMessage(t("restockError"));
                } finally {
                  submitting.current = false;
                  setBusy(undefined);
                }
              }}
            >
              <div className={styles.variant}>
                <strong>{label}</strong>
                <span>{t("available", { count: row.quantity })}</span>
              </div>
              <Input
                label={t("arriving")}
                aria-label={t("addFor", { variant: label })}
                name="quantity"
                type="number"
                min={1}
                max={2147483647}
                step={1}
                required
                disabled={busy !== undefined}
                className={styles.quantity}
              />
              <Button
                type="submit"
                variant="primary"
                className={styles.submit}
                disabled={busy !== undefined && busy !== row.id}
                pending={busy === row.id}
              >
                {busy === row.id ? t("saving") : t("addStock")}
              </Button>
            </form>
          );
        })}
      </div>
      {message ? (
        <p className={failed ? styles.error : styles.success} role={failed ? "alert" : "status"}>
          {message}
        </p>
      ) : null}
    </Panel>
  );
}
