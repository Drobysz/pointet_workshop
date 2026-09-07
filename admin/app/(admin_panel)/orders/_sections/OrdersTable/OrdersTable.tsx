"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { EntityTable, PageHeader, StatePanel, StatusBadge } from "@/components";
import { useAppFormatters, useTableQueryState } from "@/hooks";
import type { Order } from "@/interface/domain";
import { getOrders } from "@/queries";

export function OrdersTable() {
  const t = useTranslations("orders");
  const { formatCurrency, formatDate } = useAppFormatters();
  const tableState = useTableQueryState();
  const orders = useSWR(
    ["orders", tableState.page, tableState.searchQuery],
    () => getOrders(tableState.page, tableState.searchQuery),
    { keepPreviousData: true },
  );

  const header = (
    <PageHeader title={t("title")} description={t("description")} />
  );

  if (orders.isLoading && !orders.data) {
    return <>{header}<StatePanel state="loading" /></>;
  }

  if (orders.error || !orders.data) {
    return (
      <>
        {header}
        <StatePanel state="error" onRetry={() => void orders.mutate()} />
      </>
    );
  }

  const columns = [
    {
      key: "id",
      label: t("order"),
      render: (order: Order) => (
        <Link href={`/orders/${order.id}`} data-link>#{order.id}</Link>
      ),
    },
    {
      key: "customer",
      label: t("customer"),
      render: (order: Order) => order.customer_name,
    },
    {
      key: "status",
      label: t("status"),
      render: (order: Order) => <StatusBadge value={order.status} />,
    },
    {
      key: "placed",
      label: t("placedColumn"),
      render: (order: Order) => formatDate(order.placed_at),
    },
    {
      key: "total",
      label: t("total"),
      align: "right" as const,
      render: (order: Order) => formatCurrency(order.total),
    },
  ];

  const hasNoOrders = !orders.data.data.length && !tableState.searchQuery;

  return (
    <>
      {header}
      {hasNoOrders ? (
        <StatePanel state="empty" />
      ) : (
        <EntityTable<Order>
          rows={orders.data.data}
          rowKey={(order) => order.id}
          search={tableState.searchInput}
          page={orders.data.meta.current_page}
          totalPages={orders.data.meta.last_page}
          total={orders.data.meta.total}
          onSearch={tableState.setSearchInput}
          onPage={tableState.setPage}
          columns={columns}
        />
      )}
    </>
  );
}
