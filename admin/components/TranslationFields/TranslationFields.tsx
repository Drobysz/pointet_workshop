"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { supportedLocales } from "@/i18n/config";
import type {
  TranslatableEntity,
  TranslatableKind,
  TranslationsPayload,
} from "@/interface/domain";
import { getTranslationUsage, regenerateTranslations } from "@/queries";
import { cn } from "@/helpers";
import { Button } from "../Button/Button";
import { Input, Select } from "../Field/Field";
import styles from "./translation-fields.module.scss";

function withoutLocale(edits: TranslationsPayload, locale: string): TranslationsPayload {
  return Object.fromEntries(Object.entries(edits).filter(([key]) => key !== locale));
}

interface TranslationFieldsProps {
  /** Record being edited; absent when creating. */
  entity?: TranslatableEntity;
  kind: TranslatableKind;
  sourceLocale: string;
  onSourceLocaleChange: (locale: string) => void;
  /** Unsaved manual edits; the parent sends them with the form. */
  edits: TranslationsPayload;
  onEditsChange: (edits: TranslationsPayload) => void;
  disabled?: boolean;
  /** Called after a regeneration was queued so the parent can refresh the record. */
  onRegenerated?: () => Promise<void> | void;
  /** Numeric id of the record, required for regeneration. */
  entityId?: number;
}

/**
 * Source-language selector plus one input per other supported language.
 * Typing replaces the automatic translation with a manual one; the reset
 * control hands the language back to automatic translation on save.
 * Only the translatable short labels are listed: descriptions never appear here.
 */
export function TranslationFields({
  entity,
  kind,
  sourceLocale,
  onSourceLocaleChange,
  edits,
  onEditsChange,
  disabled = false,
  onRegenerated,
  entityId,
}: TranslationFieldsProps) {
  const t = useTranslations("translations");
  const languages = useTranslations("languages");
  const [message, setMessage] = useState<{ text: string; isError: boolean }>();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const usage = useSWR("translation-usage", getTranslationUsage, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const usageData = usage.data?.data;
  const targets = supportedLocales.filter((locale) => locale !== sourceLocale);

  function changeSource(locale: string) {
    // The new source language has no translation of its own any more.
    onEditsChange(withoutLocale(edits, locale));
    onSourceLocaleChange(locale);
  }

  function edit(locale: string, value: string) {
    onEditsChange({ ...edits, [locale]: { name: value } });
  }

  function reset(locale: string) {
    const current = entity?.translations?.[locale];
    if (current?.name_is_manual) {
      onEditsChange({ ...edits, [locale]: { name: null } });
      return;
    }
    onEditsChange(withoutLocale(edits, locale));
  }

  function statusOf(locale: string): string {
    const pending = edits[locale];
    if (pending) {
      return pending.name === null ? t("status.reset") : t("status.unsaved");
    }
    const current = entity?.translations?.[locale];
    if (!current || current.name === null) return t("status.pending");
    if (current.name_is_manual) return t("status.manual");
    if (current.name_is_stale) return t("status.stale");
    return t("status.automatic");
  }

  async function regenerate() {
    if (!entityId) return;
    setIsRegenerating(true);
    setMessage(undefined);
    try {
      await regenerateTranslations(kind, entityId);
      setMessage({ text: t("regenerateQueued"), isError: false });
      await onRegenerated?.();
    } catch {
      setMessage({ text: t("regenerateError"), isError: true });
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <fieldset className={styles.root} disabled={disabled}>
      <legend className={styles.legend}>{t("title")}</legend>
      <div className={styles.header}>
        <p className={styles.message}>{t("description")}</p>
        {entityId && onRegenerated ? (
          <Button
            variant="secondary"
            size="sm"
            pending={isRegenerating}
            disabled={usageData ? !usageData.enabled || usageData.exhausted : false}
            onClick={() => void regenerate()}
          >
            <RotateCcw size={15} aria-hidden="true" />
            {t("regenerate")}
          </Button>
        ) : null}
      </div>

      {usageData && !usageData.enabled ? (
        <p className={styles.notice} role="status">{t("disabled")}</p>
      ) : null}
      {usageData?.enabled && usageData.exhausted ? (
        <p className={cn(styles.notice, styles.warning)} role="status">{t("quotaExhausted")}</p>
      ) : null}

      <Select
        label={t("sourceLocale")}
        hint={t("sourceLocaleHint")}
        value={sourceLocale}
        onChange={(event) => changeSource(event.target.value)}
      >
        {supportedLocales.map((locale) => (
          <option key={locale} value={locale} lang={locale}>
            {languages(locale)}
          </option>
        ))}
      </Select>

      <div className={styles.rows}>
        {targets.map((locale) => {
          const current = entity?.translations?.[locale];
          const pending = edits[locale];
          const value = pending
            ? pending.name ?? ""
            : current?.name ?? "";
          const isManual = pending ? pending.name !== null : Boolean(current?.name_is_manual);
          const canReset = Boolean(pending) || Boolean(current?.name_is_manual);

          return (
            <div key={locale} className={cn(styles.row, isManual && styles.manual)}>
              <Input
                label={languages(locale)}
                lang={locale}
                value={value}
                placeholder={t("placeholder")}
                hint={statusOf(locale)}
                maxLength={255}
                onChange={(event) => edit(locale, event.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                icon
                aria-label={t("resetLabel", { language: languages(locale) })}
                title={t("reset")}
                disabled={!canReset}
                onClick={() => reset(locale)}
              >
                <RotateCcw size={15} aria-hidden="true" />
              </Button>
            </div>
          );
        })}
      </div>

      {usageData?.enabled && !usageData.exhausted ? (
        <p className={styles.message}>
          {usageData.character_limit
            ? t("usage", { used: usageData.characters_used, limit: usageData.character_limit })
            : t("usageUnlimited", { used: usageData.characters_used })}
        </p>
      ) : null}
      {message ? (
        <p className={cn(styles.message, message.isError && styles.warning)} role={message.isError ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}
    </fieldset>
  );
}
