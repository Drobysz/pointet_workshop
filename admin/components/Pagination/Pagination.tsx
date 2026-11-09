"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import styles from "./pagination.module.scss";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  className?: string;
}

type PageItem = number | "start-ellipsis" | "end-ellipsis";

/** First, last and the neighbours of the current page, with ellipses between. */
function getPageItems(page: number, totalPages: number): PageItem[] {
  const visible = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((value) => {
      const isBoundary = value === 1 || value === totalPages;

      return isBoundary || Math.abs(value - page) <= 1;
    });

  return visible.flatMap((value, index): PageItem[] => {
    const previous = visible[index - 1];
    const hasGap = index > 0 && value - previous > 1;
    const gap: PageItem = value < page ? "start-ellipsis" : "end-ellipsis";

    return hasGap ? [gap, value] : [value];
  });
}

/** Storefront catalog pagination: bordered squares, the current one filled red. */
export function Pagination({
  page,
  totalPages,
  onPage,
  className,
}: PaginationProps) {
  const t = useTranslations("table");
  const items = getPageItems(page, totalPages);

  return (
    <nav className={cn(styles.nav, className)} aria-label={t("paginationLabel")}>
      <button
        type="button"
        className={styles.switcher}
        disabled={page <= 1}
        aria-label={t("previous")}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <ul className={styles.pages}>
        {items.map((item) => {
          if (typeof item !== "number") {
            return (
              <li key={item} className={styles.ellipsis} aria-hidden="true">
                …
              </li>
            );
          }

          const isCurrent = item === page;

          return (
            <li key={item}>
              <button
                type="button"
                className={cn(styles.page, isCurrent && styles.current)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={t("pageLabel", { page: item })}
                onClick={() => onPage(item)}
              >
                {item}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={styles.switcher}
        disabled={page >= totalPages}
        aria-label={t("next")}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight size={22} aria-hidden="true" />
      </button>
    </nav>
  );
}
