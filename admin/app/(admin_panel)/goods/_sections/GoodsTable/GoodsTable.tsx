"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { EntityTable, PageHeader, StatePanel, StatusBadge } from "@/components";
import { useAppFormatters, useTableQueryState } from "@/hooks";
import type { Good } from "@/interface/domain";
import { getGoods } from "@/queries";
import actionStyles from "@/components/TableActions/table-actions.module.scss";
import { GoodFormModal } from "../GoodFormModal/GoodFormModal";

export function GoodsTable() {
  const t = useTranslations("goods");
  const common = useTranslations("common");
  const { formatCurrency } = useAppFormatters();
  const tableState = useTableQueryState();
  const [editingGood, setEditingGood] = useState<Good | "new">();
  const goods = useSWR(
    ["goods", tableState.page, tableState.searchQuery],
    () => getGoods(tableState.page, tableState.searchQuery),
    { keepPreviousData: true },
  );

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description")}
      actions={(
        <button
          className={actionStyles.primary}
          type="button"
          onClick={() => setEditingGood("new")}
        >
          <Plus size={17} />
          {t("create")}
        </button>
      )}
    />
  );

  if (goods.isLoading && !goods.data) {
    return <>{header}<StatePanel state="loading" /></>;
  }

  if (goods.error || !goods.data) {
    return (
      <>
        {header}
        <StatePanel state="error" onRetry={() => void goods.mutate()} />
      </>
    );
  }

  const columns = [
    {
      key: "name",
      label: t("product"),
      render: (good: Good) => (
        <Link href={`/goods/${good.id}`} data-link>{good.name}</Link>
      ),
    },
    {
      key: "brand",
      label: t("brand"),
      render: (good: Good) => good.brand,
    },
    {
      key: "subcategory",
      label: t("subcategory"),
      render: (good: Good) => good.subcategory?.name ?? "—",
    },
    {
      key: "colors",
      label: t("colors"),
      render: (good: Good) => (
        good.colors.map((color) => color.name).join(", ") || "—"
      ),
    },
    {
      key: "stock",
      label: t("stock"),
      align: "right" as const,
      render: (good: Good) => good.current_quantity,
    },
    {
      key: "weigh",
      label: t("weigh"),
      align: "right" as const,
      render: (good: Good) => `${good.weigh} g`,
    },
    {
      key: "visibility",
      label: t("visibility"),
      render: (good: Good) => (
        <StatusBadge value={good.visible ? "visible" : "hidden"} />
      ),
    },
    {
      key: "price",
      label: t("price"),
      align: "right" as const,
      render: (good: Good) => formatCurrency(good.price),
    },
    {
      key: "actions",
      label: common("actions"),
      align: "right" as const,
      render: (good: Good) => (
        <button
          className={actionStyles.iconButton}
          type="button"
          aria-label={`${t("edit")} ${good.name}`}
          onClick={() => setEditingGood(good)}
        >
          <Pencil size={16} />
        </button>
      ),
    },
  ];

  const hasNoGoods = !goods.data.data.length && !tableState.searchQuery;

  return (
    <>
      {header}
      {hasNoGoods ? (
        <StatePanel state="empty" />
      ) : (
        <EntityTable<Good>
          rows={goods.data.data}
          rowKey={(good) => good.id}
          search={tableState.searchInput}
          page={goods.data.meta.current_page}
          totalPages={goods.data.meta.last_page}
          total={goods.data.meta.total}
          onSearch={tableState.setSearchInput}
          onPage={tableState.setPage}
          columns={columns}
        />
      )}
      {editingGood ? (
        <GoodFormModal
          good={editingGood === "new" ? undefined : editingGood}
          onClose={() => setEditingGood(undefined)}
          onSaved={async () => {
            await goods.mutate();
          }}
        />
      ) : null}
    </>
  );
}
