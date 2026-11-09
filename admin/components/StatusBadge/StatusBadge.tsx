"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import styles from "./status-badge.module.scss";

type Tone = "success" | "danger" | "warning" | "info" | "neutral";

const tones: Record<string, Tone> = {
  paid: "success",
  approved: "success",
  delivered: "success",
  completed: "success",
  confirmed: "success",
  visible: "success",
  failed: "danger",
  declined: "danger",
  cancelled: "danger",
  canceled: "danger",
  reported: "danger",
  pending: "warning",
  processing: "warning",
  shipped: "info",
  sent: "info",
  refunded: "info",
  hidden: "neutral",
};

export function StatusBadge({ value }: { value: string }) {
  const t = useTranslations("statuses");
  const normalizedValue = value.toLowerCase().replaceAll(" ", "_");
  const label = t.has(normalizedValue)
    ? t(normalizedValue)
    : value.replaceAll("_", " ");
  const tone = tones[normalizedValue] ?? "neutral";

  return (
    <span className={cn(styles.badge, styles[tone])}>
      {label}
    </span>
  );
}
