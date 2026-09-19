import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, it, vi } from "vitest";
import messages from "@/messages/fr.json";
import type { Good } from "@/interface/domain";
import { InventoryStock } from "./InventoryStock";
import { restockInventory } from "@/queries";
vi.mock("@/queries", () => ({ restockInventory: vi.fn() }));

it("adds arriving units to the chosen inventory row and prevents duplicate submissions", async () => {
  const product = { id: 1, colors: [{ id: 2, name: "Red", hexcode: "#ff0000" }], inventory: [{ id: 3, good_id: 1, color_id: 2, size: "43.5", quantity: 4 }] } as Good;
  let complete!: (value: { data: Good }) => void;
  vi.mocked(restockInventory).mockImplementation(() => new Promise((resolve) => { complete = resolve; }));
  const onUpdated = vi.fn(async () => {});
  render(<NextIntlClientProvider locale="fr" messages={messages}><InventoryStock product={product} onUpdated={onUpdated} /></NextIntlClientProvider>);
  fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "5" } });
  const form = screen.getByRole("button", { name: messages.inventory.addStock }).closest("form")!;
  fireEvent.submit(form); fireEvent.submit(form);
  expect(restockInventory).toHaveBeenCalledTimes(1);
  expect(restockInventory).toHaveBeenCalledWith(1, 3, 5);
  complete({ data: { ...product, current_quantity: 9 } });
  await waitFor(() => expect(onUpdated).toHaveBeenCalledTimes(1));
  expect(screen.getByRole("status")).toHaveTextContent("5 unité(s) ajoutée(s)");
});
