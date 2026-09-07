"use client";

import { useTranslations } from "next-intl";
import styles from "./status-badge.module.scss";

export function StatusBadge({ value }: { value: string }) {
  const t = useTranslations("statuses");
  const normalizedValue = value.toLowerCase().replaceAll(" ", "_");
  const label = t.has(normalizedValue)
    ? t(normalizedValue)
    : value.replaceAll("_", " ");

  return (
    <span className={`${styles.badge} ${styles[normalizedValue] ?? ""}`}>
      {label}
    </span>
  );
}
