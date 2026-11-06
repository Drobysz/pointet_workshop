"use client";

import { useLocale } from "next-intl";
import {
  formatAnalyticsBucket,
  formatCurrency,
  formatDate,
  formatNumber,
  formatWeight,
} from "@/helpers";

export function useAppFormatters() {
  const locale = useLocale();

  return {
    formatCurrency: (value: string | number, currency?: string) => {
      return formatCurrency(value, locale, currency);
    },
    formatDate: (value: string) => {
      return formatDate(value, locale);
    },
    formatNumber: (value: string | number) => {
      return formatNumber(value, locale);
    },
    formatWeight: (value: string | number) => {
      return formatWeight(value, locale);
    },
    formatAnalyticsBucket: (value: string) => {
      return formatAnalyticsBucket(value, locale);
    },
  };
}
