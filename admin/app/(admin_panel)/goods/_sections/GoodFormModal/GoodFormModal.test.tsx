import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { SWRConfig } from "swr";
import { beforeEach, expect, it, vi } from "vitest";
import messages from "@/messages/fr.json";
import { GoodFormModal } from "./GoodFormModal";
import { createGood, uploadProductImage, updateGood } from "@/queries";

vi.mock("@/queries", () => ({
  getCatalogOptions: vi.fn(async () => ({ categories: [{ id: 1, name: "Home", subcategories: [{ id: 1, name: "Chairs" }] }] })),
  getMarkerOptions: vi.fn(async (kind: string) => ({ data: kind === "colors" ? [{ id: 2, name: "Brown", hexcode: "#654321" }] : [{ id: 3, name: "Wood" }], meta: { current_page: 1, last_page: 1, total: 1 } })),
  getGood: vi.fn(),
  createGood: vi.fn(async () => ({ data: { id: 42, inventory_version: 1, inventory: [{ id: 5, good_id: 42, color_id: 2, size: null, quantity: 0 }] } })),
  updateGood: vi.fn(async () => ({ data: { id: 42, inventory_version: 1, inventory: [{ id: 5, good_id: 42, color_id: 2, size: null, quantity: 0 }] } })),
  uploadProductImage: vi.fn(),
  updateProductImage: vi.fn(),
  deleteProductImage: vi.fn(),
  getTranslationUsage: vi.fn(async () => ({ data: { enabled: true, provider: "deepl", period: "2026-11", characters_used: 120, character_limit: 500000, exhausted: false, exhausted_at: null } })),
  regenerateTranslations: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:test-image");
  URL.revokeObjectURL = vi.fn();
});

it("retries only remaining images on the same product after a partial upload failure", async () => {
  const saved = vi.fn(async () => {});
  vi.mocked(uploadProductImage).mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce({});
  render(<NextIntlClientProvider locale="fr" messages={messages}><SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><GoodFormModal onClose={vi.fn()} onSaved={saved} /></SWRConfig></NextIntlClientProvider>);
  fireEvent.change(await screen.findByLabelText(messages.goods.form.name), { target: { value: "Oak chair" } });
  fireEvent.change(screen.getByLabelText(messages.goods.form.brand), { target: { value: "Atelier Nord" } });
  fireEvent.change(screen.getByLabelText(messages.goods.form.price), { target: { value: "25" } });
  fireEvent.change(screen.getByLabelText(messages.goods.form.weigh), { target: { value: "640" } });
  fireEvent.change(screen.getByLabelText(messages.goods.form.category), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText(messages.goods.form.subcategory), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText(messages.goods.form.description), { target: { value: "Restored oak chair" } });
  fireEvent.click(await screen.findByRole("checkbox", { name: "Brown" }));
  fireEvent.click(await screen.findByRole("checkbox", { name: "Wood" }));
  const first = new File(["png"], "front.png", { type: "image/png" });
  const second = new File(["png"], "back.png", { type: "image/png" });
  fireEvent.drop(screen.getByText(messages.images.drop), { dataTransfer: { files: [first, second] } });
  fireEvent.submit(screen.getByRole("button", { name: messages.common.save }).closest("form")!);
  expect(await screen.findByRole("alert")).toHaveTextContent(messages.goods.images.retryError);
  expect(screen.getByLabelText(messages.goods.form.name)).toHaveValue("Oak chair");
  fireEvent.submit(screen.getByRole("button", { name: messages.common.save }).closest("form")!);
  await waitFor(() => expect(saved).toHaveBeenCalledTimes(1));
  expect(createGood).toHaveBeenCalledTimes(1);
  expect(updateGood).toHaveBeenCalledWith(42, expect.objectContaining({ brand: "Atelier Nord", weigh: 640, inventory_version: 1, inventory: [{ id: 5, color_id: 2, size: null, quantity: 0 }], material_ids: [3], source_locale: "fr" }));
  expect(updateGood).toHaveBeenCalledWith(42, expect.not.objectContaining({ translations: expect.anything() }));
  expect(uploadProductImage).toHaveBeenNthCalledWith(1, 42, 2, first);
  expect(uploadProductImage).toHaveBeenNthCalledWith(2, 42, 2, second);
  expect(uploadProductImage).toHaveBeenNthCalledWith(3, 42, 2, second);
});
