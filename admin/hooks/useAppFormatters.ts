"use client";

import { useLocale } from "next-intl";
import { formatCurrency, formatDate } from "@/helpers";

export function useAppFormatters() {
  const locale = useLocale();

  return {
    formatCurrency: (value: string | number) => {
      return formatCurrency(value, locale);
    },
    formatDate: (value: string) => {
      return formatDate(value, locale);
    },
  };
}
