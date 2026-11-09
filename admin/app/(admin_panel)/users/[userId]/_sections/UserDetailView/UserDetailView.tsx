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
    ["user-orders", userId, tableState.searchQuery],
    () => getOrders(tableState.searchQuery, userId),
    { keepPreviousData: true },
  );

  const isInitialLoading = user.isLoading
    || (orders.isLoading && !orders.data);

  if (isInitialLoading) {
    return <Panel><StatePanel state="loading" /></Panel>;
  }

  if (user.error || orders.error || !user.data || !orders.data) {
    return (
      <Panel>
        <StatePanel
          state="error"
          onRetry={() => {
            void user.mutate();
            void orders.mutate();
          }}
        />
      </Panel>
    );
  }

  const profile = user.data.data;
  const columns = [
    {
      key: "id",
      label: ordersCopy("order"),
      render: (order: Order) => (
        <Link href={`/orders/${order.id}`}>#{order.id}</Link>
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
  const facts = [
    { key: "email", label: common("email"), value: profile.email },
    { key: "verification", label: t("verification"), value: verification },
    { key: "joined", label: t("joined"), value: formatDate(profile.created_at) },
  ];

  return (
    <>
      <PageHeader
        title={profile.full_name}
        description={t("profileDescription")}
        back={{ href: "/users", label: t("back") }}
      />

      <Panel className={styles.profile} aria-label={t("profile")}>
        {facts.map((fact) => (
          <div key={fact.key} className={styles.fact}>
            <span className={styles.factLabel}>{fact.label}</span>
            <strong className={styles.factValue}>{fact.value}</strong>
          </div>
        ))}
      </Panel>

      <h2 className={styles.heading}>{t("orders")}</h2>
      {showOrdersTable ? (
        <EntityTable<Order>
          rows={orders.data.data}
          rowKey={(order) => order.id}
          search={tableState.searchInput}
          total={orders.data.data.length}
          onSearch={tableState.setSearchInput}
          columns={columns}
        />
      ) : (
        <Panel><StatePanel state="empty" compact /></Panel>
      )}
    </>
  );
}
