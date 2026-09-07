"use client";

import { useTranslations } from "next-intl";
import type { StatePanelProps } from "./StatePanel.props";
import styles from "./state-panel.module.scss";

export function StatePanel({ state, onRetry }: StatePanelProps) {
  const t = useTranslations("states");
  const canRetry = state === "error" && onRetry;

  return (
    <div
      className={styles.panel}
      role={state === "error" ? "alert" : "status"}
    >
      <strong>{t(`${state}.title`)}</strong>
      <span>{t(`${state}.description`)}</span>
      {canRetry ? (
        <button type="button" onClick={onRetry}>
          {t("retry")}
        </button>
      ) : null}
    </div>
  );
}
