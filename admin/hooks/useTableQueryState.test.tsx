import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTableQueryState } from "./useTableQueryState";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

function SearchHarness() {
  const tableState = useTableQueryState();

  return (
    <>
      <input
        aria-label="Recherche"
        value={tableState.searchInput}
        onChange={(event) => tableState.setSearchInput(event.target.value)}
      />
      <output data-testid="query">{tableState.searchQuery}</output>
    </>
  );
}

describe("useTableQueryState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.history.replaceState({}, "", "/users");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the search field focused while applying a delayed query", () => {
    render(<SearchHarness />);
    const searchInput = screen.getByRole("textbox", { name: "Recherche" });

    searchInput.focus();
    fireEvent.change(searchInput, { target: { value: "alice" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(searchInput).toHaveFocus();
    expect(screen.getByTestId("query")).toHaveTextContent("alice");
    expect(window.location.search).toBe("?search=alice");
  });
});
