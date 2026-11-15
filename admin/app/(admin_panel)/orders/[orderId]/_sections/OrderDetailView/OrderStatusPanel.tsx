"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Panel, PanelHeader, Select } from "@/components";
import { orderStatuses, type OrderStatus } from "@/interface/domain";
import { updateOrderStatus } from "@/queries";
import styles from "./order-detail-view.module.scss";

interface OrderStatusPanelProps {
  orderId: number;
  status: string;
  /** Called after the status was saved so the order is reloaded. */
  onChanged: () => void;
}

type Feedback = "success" | "error" | null;

/** Lets an admin move the order through its lifecycle; the customer is emailed on every change. */
export function OrderStatusPanel({ orderId, status, onChanged }: OrderStatusPanelProps) {
  const t = useTranslations("orders.statusPanel");
  const statusLabels = useTranslations("statuses");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function change(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as OrderStatus;

    if (next === status) {
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      await updateOrderStatus(orderId, next);
      setFeedback("success");
      onChanged();
    } catch {
      setFeedback("error");
    } finally {
      setPending(false);
    }
  }

  return (
    <Panel>
      <PanelHeader title={t("title")} description={t("description")} />
      <div className={styles.trackingForm}>
        <Select
          label={t("label")}
          value={status}
          disabled={pending}
          aria-busy={pending || undefined}
          onChange={(event) => void change(event)}
        >
          {orderStatuses.map((value) => (
            <option key={value} value={value}>
              {statusLabels(value)}
            </option>
          ))}
        </Select>
        {feedback === "success" ? (
          <p className={styles.trackingSuccess} role="status">{t("success")}</p>
        ) : null}
        {feedback === "error" ? (
          <p className={styles.trackingError} role="alert">{t("error")}</p>
        ) : null}
      </div>
    </Panel>
  );
}
