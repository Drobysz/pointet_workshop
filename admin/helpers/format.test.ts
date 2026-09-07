import { describe, expect, it } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats backend money strings in euros", () => {
    const formattedPrice = formatCurrency("1299.50", "fr-FR");

    expect(formattedPrice).toContain("1 299,50");
    expect(formattedPrice).toContain("€");
    expect(formattedPrice).not.toContain("$");
  });
});
