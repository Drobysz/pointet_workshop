"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Button,
  EntityTable,
  PageHeader,
  Panel,
  StatePanel,
  StatusBadge,
} from "@/components";
import { useAppFormatters, useTableQueryState } from "@/hooks";
import type { Good } from "@/interface/domain";
import { getGoods } from "@/queries";
import { GoodFormModal } from "../GoodFormModal/GoodFormModal";

export function GoodsTable() {
  const t = useTranslations("goods");
  const common = useTranslations("common");
  const {
    formatCurrency,
    formatNumber,
    formatWeight,
  } = useAppFormatters();
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
        <Button variant="primary" onClick={() => setEditingGood("new")}>
          <Plus size={17} aria-hidden="true" />
          {t("create")}
        </Button>
      )}
    />
  );

  if (goods.isLoading && !goods.data) {
    return <>{header}<Panel><StatePanel state="loading" /></Panel></>;
  }

  if (goods.error || !goods.data) {
    return (
      <>
        {header}
        <Panel>
          <StatePanel state="error" onRetry={() => void goods.mutate()} />
        </Panel>
      </>
    );
  }

  const columns = [
    {
      key: "name",
      label: t("product"),
      render: (good: Good) => (
        <Link href={`/goods/${good.id}`}>{good.name}</Link>
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
      render: (good: Good) => formatNumber(good.current_quantity),
    },
    {
      key: "weigh",
      label: t("weigh"),
      align: "right" as const,
      render: (good: Good) => formatWeight(good.weigh),
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
        <Button
          variant="ghost"
          icon
          size="sm"
          aria-label={t("editLabel", { name: good.name })}
          onClick={() => setEditingGood(good)}
        >
          <Pencil size={15} aria-hidden="true" />
        </Button>
      ),
    },
  ];

  const hasNoGoods = !goods.data.data.length && !tableState.searchQuery;

  return (
    <>
      {header}
      {hasNoGoods ? (
        <Panel><StatePanel state="empty" /></Panel>
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
