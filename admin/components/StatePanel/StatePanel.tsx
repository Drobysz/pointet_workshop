"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import { Button } from "../Button/Button";
import { Spinner } from "../Spinner/Spinner";
import type { StatePanelProps } from "./StatePanel.props";
import styles from "./state-panel.module.scss";

export function StatePanel({ state, onRetry, compact = false }: StatePanelProps) {
  const t = useTranslations("states");
  const canRetry = state === "error" && onRetry;

  return (
    <div
      className={cn(styles.panel, compact && styles.compact)}
      role={state === "error" ? "alert" : "status"}
    >
      {state === "loading" ? <Spinner size={28} className={styles.spinner} /> : null}
      <strong className={styles.title}>{t(`${state}.title`)}</strong>
      <span className={styles.description}>{t(`${state}.description`)}</span>
      {canRetry ? (
        <Button variant="secondary" className={styles.retry} onClick={onRetry}>
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
}
