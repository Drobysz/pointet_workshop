"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import { Pagination } from "../Pagination/Pagination";
import { SearchField } from "../SearchField/SearchField";
import type { EntityTableProps } from "./EntityTable.props";
import styles from "./entity-table.module.scss";

export function EntityTable<T>({
  columns,
  rows,
  rowKey,
  search = "",
  page,
  totalPages,
  total,
  onSearch,
  onPage,
}: EntityTableProps<T>) {
  const t = useTranslations("table");
  const pagination = page !== undefined
    && totalPages !== undefined
    && onPage !== undefined
    ? { page, totalPages, onPage }
    : null;

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        {onSearch ? (
          <SearchField
            className={styles.search}
            value={search}
            onChange={onSearch}
            label={t("searchLabel")}
            placeholder={t("searchPlaceholder")}
          />
        ) : null}
        <span className={styles.count}>{t("results", { count: total })}</span>
      </div>

      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(column.align === "right" && styles.right)}
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
                    className={cn(column.align === "right" && styles.right)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className={styles.footer}>
          <span className={styles.pageInfo}>
            {t("pageInfo", { page: pagination.page, total: pagination.totalPages })}
          </span>
          <Pagination {...pagination} />
        </div>
      ) : null}
    </section>
  );
}
