import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { SWRConfig } from "swr";
import { expect, it, vi } from "vitest";
import messages from "@/messages/fr.json";
import { MarkerPicker, type SelectableMarker } from "./MarkerPicker";

vi.mock("@/queries", () => ({
  getMarkerOptions: vi.fn(async (_kind: string, page: number, search: string) => ({
    data: search ? [{ id: 101, name: "Gold", hexcode: "#ffd700" }] : page === 2 ? [{ id: 102, name: "White", hexcode: "#ffffff" }] : [{ id: 1, name: "Black", hexcode: "#000000" }],
    meta: { current_page: page, last_page: search ? 1 : 2, per_page: 50, total: 51 },
  })),
}));

function Form() {
  const [selected, setSelected] = useState<SelectableMarker[]>([]);
  return <form aria-label="Product"><MarkerPicker kind="colors" name="color_ids" label="Couleurs" selected={selected} onChange={setSelected} /></form>;
}

it("preserves selections across server search and pages in submitted form data", async () => {
  render(<NextIntlClientProvider locale="fr" messages={messages}><SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><Form /></SWRConfig></NextIntlClientProvider>);
  fireEvent.click(await screen.findByRole("checkbox", { name: "Black" }));
  fireEvent.click(screen.getByRole("button", { name: messages.picker.next }));
  fireEvent.click(await screen.findByRole("checkbox", { name: "White" }));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "gold" } });
  fireEvent.click(await screen.findByRole("checkbox", { name: "Gold" }));
  await waitFor(() => expect(new FormData(screen.getByRole("form") as HTMLFormElement).getAll("color_ids")).toEqual(["1", "102", "101"]));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
  expect(await screen.findByRole("checkbox", { name: "Black" })).toBeChecked();
});
