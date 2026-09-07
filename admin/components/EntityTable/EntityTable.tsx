"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EntityTableProps } from "./EntityTable.props";
import styles from "./entity-table.module.scss";

function getVisiblePages(page: number, totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (value) => {
      const isBoundary = value === 1 || value === totalPages;
      const isNearCurrentPage = Math.abs(value - page) <= 1;

      return isBoundary || isNearCurrentPage;
    },
  );
}

export function EntityTable<T>({
  columns,
  rows,
  rowKey,
  search,
  page,
  totalPages,
  total,
  onSearch,
  onPage,
}: EntityTableProps<T>) {
  const t = useTranslations("table");
  const pages = getVisiblePages(page, totalPages);

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <label>
          <Search size={17} />
          <span className="sr-only">{t("searchLabel")}</span>
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
          />
        </label>
        <span>{t("results", { count: total })}</span>
      </div>

      <div className={styles.scroller}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.align === "right" ? styles.right : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align === "right" ? styles.right : undefined}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav className={styles.pagination} aria-label={t("paginationLabel")}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          {t("previous")}
        </button>
        <div>
          {pages.map((value, index) => {
            const previousPage = pages[index - 1];
            const hasGap = index > 0 && value - previousPage > 1;

            return (
              <span key={value}>
                {hasGap ? <i>…</i> : null}
                <button
                  type="button"
                  aria-current={value === page ? "page" : undefined}
                  onClick={() => onPage(value)}
                >
                  {value}
                </button>
              </span>
            );
          })}
        </div>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          {t("next")}
        </button>
      </nav>
    </section>
  );
}
