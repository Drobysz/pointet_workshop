"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition, type ChangeEvent } from "react";
import {
  isAppLocale,
  localeCookieName,
  supportedLocales,
} from "@/i18n/config";
import { cn } from "@/helpers";
import styles from "./locale-switcher.module.scss";

interface LocaleSwitcherProps {
  /** `compact` hides the label and keeps the globe (sidebar rail). */
  variant?: "full" | "compact";
  className?: string;
}

/** Writes the admin locale cookie and refreshes the server-rendered copy. */
export function LocaleSwitcher({ variant = "full", className }: LocaleSwitcherProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("navigation");
  const languageNames = useTranslations("languages");
  const [isPending, startTransition] = useTransition();

  function changeLocale(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;

    if (!isAppLocale(nextLocale)) {
      return;
    }

    const oneYear = 60 * 60 * 24 * 365;

    document.cookie = [
      `${localeCookieName}=${nextLocale}`,
      "path=/",
      `max-age=${oneYear}`,
      "samesite=lax",
    ].join("; ");

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <label
      className={cn(styles.switcher, variant === "compact" && styles.compact, className)}
      title={t("language")}
    >
      <Globe size={18} aria-hidden="true" className={styles.icon} />
      <span className={styles.label}>{t("language")}</span>
      <select
        value={locale}
        disabled={isPending}
        aria-label={t("language")}
        className={styles.select}
        onChange={changeLocale}
      >
        {supportedLocales.map((value) => (
          <option key={value} value={value} lang={value}>
            {languageNames(value)}
          </option>
        ))}
      </select>
    </label>
  );
}
