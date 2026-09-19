import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, it } from "vitest";
import messages from "@/messages/fr.json";
import { InventoryEditor, type InventoryDraft } from "./InventoryEditor";
import { goodSchema } from "@/auth/FormSchemes";

function Editor() {
  const [rows, setRows] = useState<InventoryDraft[]>([{ key: "initial", color_id: 1, size: null, quantity: 2 }]);
  return <><InventoryEditor colors={[{ id: 1, name: "Red", hexcode: "#ff0000" }]} rows={rows} onChange={setRows} /><output data-testid="rows">{JSON.stringify(rows)}</output></>;
}

it("accepts custom numeric and letter sizes and calculates the total", () => {
  render(<NextIntlClientProvider locale="fr" messages={messages}><Editor /></NextIntlClientProvider>);
  fireEvent.change(screen.getByLabelText("Taille 1 — Red"), { target: { value: "43.5" } });
  fireEvent.click(screen.getByRole("button", { name: messages.inventory.addSize }));
  fireEvent.change(screen.getByLabelText("Taille 2 — Red"), { target: { value: "XLL" } });
  fireEvent.change(screen.getByLabelText("Quantité 2 — Red"), { target: { value: "8" } });
  expect(screen.getByText("Stock total : 10")).toBeInTheDocument();
  const rows = JSON.parse(screen.getByTestId("rows").textContent!);
  expect(rows.map((row: InventoryDraft) => row.size)).toEqual(["43.5", "XLL"]);
  fireEvent.click(screen.getByRole("button", { name: "Retirer la taille 1 — Red" }));
  expect(screen.getByText("Stock total : 8")).toBeInTheDocument();
});

it("rejects duplicate normalized sizes and quantities outside supported limits", () => {
  const payload = { name: "Shirt", category_id: 1, subcategory_id: 1, price: 10, description: "Cotton shirt", material_ids: [], inventory: [
    { color_id: 1, size: "XL", quantity: 2 }, { color_id: 1, size: " xl ", quantity: 1 },
  ] };
  expect(goodSchema.safeParse(payload).success).toBe(false);
  payload.inventory[1].size = "43.5";
  expect(goodSchema.safeParse(payload).success).toBe(true);
  payload.inventory[1].quantity = -1;
  expect(goodSchema.safeParse(payload).success).toBe(false);
});
