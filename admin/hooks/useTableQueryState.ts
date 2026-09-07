"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const searchDelay = 300;

function readInitialPage(params: URLSearchParams): number {
  const page = Number(params.get("page") ?? 1);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function readInitialSearch(params: URLSearchParams): string {
  return params.get("search") ?? "";
}

function updateBrowserUrl(page: number, search: string): void {
  const url = new URL(window.location.href);

  if (page > 1) {
    url.searchParams.set("page", String(page));
  } else {
    url.searchParams.delete("page");
  }

  if (search) {
    url.searchParams.set("search", search);
  } else {
    url.searchParams.delete("search");
  }

  window.history.replaceState(window.history.state, "", url);
}

export function useTableQueryState() {
  const searchParams = useSearchParams();
  const initialParams = new URLSearchParams(searchParams.toString());
  const [page, setPageState] = useState(() => readInitialPage(initialParams));
  const [searchInput, setSearchInput] = useState(() => {
    return readInitialSearch(initialParams);
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return readInitialSearch(initialParams);
  });

  useEffect(() => {
    if (searchInput.trim() === searchQuery) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPageState(1);
      setSearchQuery(searchInput.trim());
      updateBrowserUrl(1, searchInput.trim());
    }, searchDelay);

    return () => window.clearTimeout(timeout);
  }, [searchInput, searchQuery]);

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(nextPage);
      updateBrowserUrl(nextPage, searchQuery);
    },
    [searchQuery],
  );

  return {
    page,
    searchInput,
    searchQuery,
    setSearchInput,
    setPage,
  };
}
