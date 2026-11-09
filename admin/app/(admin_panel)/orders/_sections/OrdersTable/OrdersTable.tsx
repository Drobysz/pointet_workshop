"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  EntityTable,
  PageHeader,
  Panel,
  StatePanel,
  StatusBadge,
} from "@/components";
import { useAppFormatters, useTableQueryState } from "@/hooks";
import type { Order } from "@/interface/domain";
import { getOrders } from "@/queries";

export function OrdersTable() {
  const t = useTranslations("orders");
  const { formatCurrency, formatDate } = useAppFormatters();
  const tableState = useTableQueryState();
  const orders = useSWR(
    ["orders", tableState.searchQuery],
    () => getOrders(tableState.searchQuery),
    { keepPreviousData: true },
  );

  const header = (
    <PageHeader title={t("title")} description={t("description")} />
  );

  if (orders.isLoading && !orders.data) {
    return <>{header}<Panel><StatePanel state="loading" /></Panel></>;
  }

  if (orders.error || !orders.data) {
    return (
      <>
        {header}
        <Panel>
          <StatePanel state="error" onRetry={() => void orders.mutate()} />
        </Panel>
      </>
    );
  }

  const columns = [
    {
      key: "id",
      label: t("order"),
      render: (order: Order) => (
        <Link href={`/orders/${order.id}`}>#{order.id}</Link>
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
        <Panel><StatePanel state="empty" /></Panel>
      ) : (
        <EntityTable<Order>
          rows={orders.data.data}
          rowKey={(order) => order.id}
          search={tableState.searchInput}
          total={orders.data.data.length}
          onSearch={tableState.setSearchInput}
          columns={columns}
        />
      )}
    </>
  );
}
