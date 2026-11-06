const currencyCodePattern = /^[A-Za-z]{3}$/;
const analyticsBucketPattern = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;

export function formatNumber(
  value: string | number,
  locale = "fr-FR",
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(Number(value));
}

export function formatCurrency(
  value: string | number,
  locale = "fr-FR",
  currency = "EUR",
): string {
  // Intl throws on malformed currency codes, so fall back to "amount CODE".
  if (!currencyCodePattern.test(currency)) {
    const amount = formatNumber(value, locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${amount} ${currency.toUpperCase()}`;
  }

  return formatNumber(value, locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  });
}

export function formatWeight(value: string | number, locale = "fr-FR"): string {
  return formatNumber(value, locale, { style: "unit", unit: "gram" });
}

export function formatDate(value: string, locale = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/**
 * Formats an analytics bucket sent by the backend ("YYYY-MM-DD" for daily
 * ranges, "YYYY-MM" for monthly ranges). Unknown shapes are returned as is.
 */
export function formatAnalyticsBucket(value: string, locale = "fr-FR"): string {
  const match = analyticsBucketPattern.exec(value);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, day ? Number(day) : 1),
  );
  const options: Intl.DateTimeFormatOptions = day
    ? { day: "numeric", month: "short" }
    : { month: "short", year: "numeric" };

  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: "UTC",
  }).format(date);
}
