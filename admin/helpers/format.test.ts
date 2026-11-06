import { describe, expect, it } from "vitest";
import {
  formatAnalyticsBucket,
  formatCurrency,
  formatWeight,
} from "./format";

describe("formatCurrency", () => {
  it("formats backend money strings in euros", () => {
    const formattedPrice = formatCurrency("1299.50", "fr-FR");

    expect(formattedPrice).toContain("1 299,50");
    expect(formattedPrice).toContain("€");
    expect(formattedPrice).not.toContain("$");
  });
});

describe("locale-aware formatters", () => {
  it("keeps the backend currency and falls back on malformed codes", () => {
    expect(formatCurrency(25, "ru", "usd")).toContain("$");
    expect(formatCurrency(25, "fr", "points")).toBe("25,00 POINTS");
  });

  it("formats weights with the localized gram unit", () => {
    expect(formatWeight(640, "fr")).toMatch(/^640\s*g$/);
    expect(formatWeight(640, "ru")).toMatch(/^640\s*г$/);
  });

  it("formats daily and monthly analytics buckets", () => {
    expect(formatAnalyticsBucket("2026-11-06", "fr")).toMatch(/^6\s+nov/);
    expect(formatAnalyticsBucket("2026-11", "ru")).toContain("2026");
    expect(formatAnalyticsBucket("week 45", "fr")).toBe("week 45");
  });
});
