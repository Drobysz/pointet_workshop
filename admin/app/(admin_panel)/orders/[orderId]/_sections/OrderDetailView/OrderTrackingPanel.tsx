"use client";

import { useState, type FormEvent } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input, Panel, PanelHeader } from "@/components";
import { useAppFormatters } from "@/hooks";
import { ApiError } from "@/helpers";
import type { OrderTrackingLink } from "@/interface/domain";
import { addOrderTrackingLink } from "@/queries";
import styles from "./order-detail-view.module.scss";

interface OrderTrackingPanelProps {
  orderId: number;
  links: OrderTrackingLink[];
  /** Called after a link was saved so the order is reloaded. */
  onAdded: () => void;
}

type Feedback = { kind: "success" | "invalid" | "error" } | null;

function isWebUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);

    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Lists the order's tracking links and lets an admin add one; the customer is emailed on save. */
export function OrderTrackingPanel({ orderId, links, onAdded }: OrderTrackingPanelProps) {
  const t = useTranslations("orders.tracking");
  const { formatDate } = useAppFormatters();
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trackingUrl = url.trim();

    if (!isWebUrl(trackingUrl)) {
      setFeedback({ kind: "invalid" });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      await addOrderTrackingLink(orderId, trackingUrl);
      setUrl("");
      setFeedback({ kind: "success" });
      onAdded();
    } catch (error) {
      setFeedback({ kind: error instanceof ApiError && error.status === 422 ? "invalid" : "error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <Panel>
      <PanelHeader title={t("title")} description={t("description")} />
      <form className={styles.trackingForm} onSubmit={(event) => void submit(event)} noValidate>
        <Input
          type="url"
          inputMode="url"
          autoComplete="off"
          label={t("label")}
          placeholder={t("placeholder")}
          hint={t("hint")}
          value={url}
          maxLength={2048}
          error={feedback?.kind === "invalid" ? t("invalid") : undefined}
          onChange={(event) => {
            setUrl(event.target.value);
            setFeedback(null);
          }}
        />
        <Button type="submit" variant="primary" pending={pending} disabled={!url.trim()}>
          {pending ? t("adding") : t("add")}
        </Button>
        {feedback?.kind === "success" ? (
          <p className={styles.trackingSuccess} role="status">{t("success")}</p>
        ) : null}
        {feedback?.kind === "error" ? (
          <p className={styles.trackingError} role="alert">{t("saveError")}</p>
        ) : null}
      </form>

      {links.length === 0 ? (
        <p className={styles.meta}>{t("empty")}</p>
      ) : (
        <ul className={styles.trackingList}>
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("open")}
                className={styles.trackingLink}
              >
                <span className={styles.trackingUrl}>{link.tracking_url}</span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
              <span className={styles.meta}>{t("added", { date: formatDate(link.created_at) })}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
