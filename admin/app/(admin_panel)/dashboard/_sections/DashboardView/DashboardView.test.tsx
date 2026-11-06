import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { SWRConfig } from "swr";
import { expect, it, vi } from "vitest";
import messages from "@/messages/fr.json";
import { DashboardView } from "./DashboardView";

vi.mock("@/queries", () => ({
  getSummary: async () => ({
    data: { users: 21, orders: 7, monthly_revenue: "70.00" },
  }),
  getAnalytics: () => new Promise(() => {}),
  getTopProducts: async () => ({
    data: [{ good_id: 1, product_name: "Chrome bag", units: 7, revenue: "70.00" }],
  }),
  getLatestOrders: async () => ({ data: [] }),
}));

it("shows other sections while sales analytics is still loading", async () => {
  render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <SWRConfig value={{ provider: () => new Map() }}>
        <DashboardView />
      </SWRConfig>
    </NextIntlClientProvider>,
  );

  expect(await screen.findByText("21")).toBeInTheDocument();
  expect(await screen.findByText("Chrome bag")).toBeInTheDocument();
  expect(await screen.findByRole("table")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(messages.states.loading.title);
});
