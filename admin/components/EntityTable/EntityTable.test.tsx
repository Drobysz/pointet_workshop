import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "@/messages/fr.json";
import { EntityTable } from "./EntityTable";

afterEach(() => {
  cleanup();
});

describe("EntityTable", () => {
  it("exposes search and pagination actions", async () => {
    const onSearch = vi.fn();
    const onPage = vi.fn();

    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <EntityTable
          rows={[{ id: 1, name: "Chaise" }]}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "name",
              label: "Nom",
              render: (row) => row.name,
            },
          ]}
          search=""
          page={1}
          totalPages={2}
          total={8}
          onSearch={onSearch}
          onPage={onPage}
        />
      </NextIntlClientProvider>,
    );

    await userEvent.type(screen.getByPlaceholderText("Rechercher"), "chêne");
    expect(onSearch).toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(onPage).toHaveBeenCalledWith(2);
  });

  it("renders a complete collection without pagination controls", () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <EntityTable
          rows={[
            { id: 1, name: "Commande 1" },
            { id: 2, name: "Commande 2" },
          ]}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "name",
              label: "Nom",
              render: (row) => row.name,
            },
          ]}
          search=""
          total={2}
          onSearch={vi.fn()}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Commande 1")).toBeInTheDocument();
    expect(screen.getByText("Commande 2")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
