"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { EntityTable, PageHeader, StatePanel, StatusBadge } from "@/components";
import { useAppFormatters, useTableQueryState } from "@/hooks";
import type { Order } from "@/interface/domain";
import { getOrders, getUser } from "@/queries";
import styles from "./user-detail-view.module.scss";

export function UserDetailView({ userId }: { userId: string }) {
  const t = useTranslations("users");
  const ordersCopy = useTranslations("orders");
  const common = useTranslations("common");
  const statuses = useTranslations("statuses");
  const { formatCurrency, formatDate } = useAppFormatters();
  const tableState = useTableQueryState();
  const user = useSWR(["user", userId], () => getUser(userId));
  const orders = useSWR(
    ["user-orders", userId, tableState.page, tableState.searchQuery],
    () => getOrders(tableState.page, tableState.searchQuery, userId),
    { keepPreviousData: true },
  );

  const isInitialLoading = user.isLoading
    || (orders.isLoading && !orders.data);

  if (isInitialLoading) {
    return <StatePanel state="loading" />;
  }

  if (user.error || orders.error || !user.data || !orders.data) {
    return (
      <StatePanel
        state="error"
        onRetry={() => {
          void user.mutate();
          void orders.mutate();
        }}
      />
    );
  }

  const profile = user.data.data;
  const columns = [
    {
      key: "id",
      label: ordersCopy("order"),
      render: (order: Order) => (
        <Link href={`/orders/${order.id}`} data-link>#{order.id}</Link>
      ),
    },
    {
      key: "status",
      label: ordersCopy("status"),
      render: (order: Order) => <StatusBadge value={order.status} />,
    },
    {
      key: "placed",
      label: ordersCopy("placedColumn"),
      render: (order: Order) => formatDate(order.placed_at),
    },
    {
      key: "total",
      label: ordersCopy("total"),
      align: "right" as const,
      render: (order: Order) => formatCurrency(order.total),
    },
  ];

  const verification = profile.email_verified_at
    ? statuses("confirmed")
    : statuses("pending");
  const showOrdersTable = Boolean(
    orders.data.data.length || tableState.searchQuery,
  );

  return (
    <>
      <PageHeader
        title={profile.full_name}
        description={t("profileDescription")}
      />
      <section className={styles.profile}>
        <div>
          <span>{common("email")}</span>
          <strong>{profile.email}</strong>
        </div>
        <div>
          <span>{t("verification")}</span>
          <strong>{verification}</strong>
        </div>
        <div>
          <span>{t("joined")}</span>
          <strong>{formatDate(profile.created_at)}</strong>
        </div>
      </section>

      <h2 className={styles.heading}>{t("orders")}</h2>
      {showOrdersTable ? (
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
      ) : (
        <StatePanel state="empty" />
      )}
    </>
  );
}
