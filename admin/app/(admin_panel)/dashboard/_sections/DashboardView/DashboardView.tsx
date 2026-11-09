"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  EntityTable,
  PageHeader,
  Panel,
  PanelHeader,
  Segmented,
  StatePanel,
  StatusBadge,
} from "@/components";
import { useAppFormatters } from "@/hooks";
import type { DashboardSummary, Order } from "@/interface/domain";
import {
  getAnalytics,
  getLatestOrders,
  getSummary,
  getTopProducts,
} from "@/queries";
import styles from "./dashboard-view.module.scss";

const SalesChart = dynamic(() => import("./SalesChart"), {
  loading: () => <StatePanel state="loading" compact />,
});

function DashboardState({ error, onRetry }: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <StatePanel state={error ? "error" : "loading"} onRetry={onRetry} compact />
  );
}

const ranges = ["week", "month", "6months", "year"] as const;
type AnalyticsRange = (typeof ranges)[number];

interface MetricCardsProps {
  summary: DashboardSummary;
  formatCurrency: (value: string | number) => string;
  formatNumber: (value: string | number) => string;
}

function MetricCards({
  summary,
  formatCurrency,
  formatNumber,
}: MetricCardsProps) {
  const t = useTranslations("dashboard");
  const cards = [
    { label: t("metrics.users"), value: formatNumber(summary.users) },
    { label: t("metrics.revenue"), value: formatCurrency(summary.monthly_revenue) },
    { label: t("metrics.orders"), value: formatNumber(summary.orders) },
  ];

  return (
    <section className={styles.metrics} aria-label={t("metricsLabel")}>
      {cards.map((card) => (
        <Panel as="article" key={card.label} className={styles.metric}>
          <span className={styles.metricLabel}>{card.label}</span>
          <strong className={styles.metricValue}>{card.value}</strong>
        </Panel>
      ))}
    </section>
  );
}

function TopProducts() {
  const t = useTranslations("dashboard");
  const { formatCurrency } = useAppFormatters();
  const products = useSWR("dashboard-top", getTopProducts);
  const items = products.data?.data;

  return (
    <Panel as="aside" className={styles.top}>
      <PanelHeader title={t("topProducts")} />
      {items?.length ? (
        <ol className={styles.topList}>
          {items.map((product, index) => (
            <li key={`${product.good_id}-${product.product_name}`}>
              <Link
                href={product.good_id ? `/goods/${product.good_id}` : "/goods"}
                className={styles.topLink}
              >
                <span className={styles.rank}>{index + 1}</span>
                <span className={styles.topCopy}>
                  <strong>{product.product_name}</strong>
                  <small>
                    {t("units", { count: product.units })} ·{` `}
                    {formatCurrency(product.revenue)}
                  </small>
                </span>
                <ArrowUpRight size={16} aria-hidden="true" className={styles.topArrow} />
              </Link>
            </li>
          ))}
        </ol>
      ) : items ? (
        <StatePanel state="empty" compact />
      ) : (
        <DashboardState error={products.error} onRetry={() => void products.mutate()} />
      )}
    </Panel>
  );
}

function LatestOrders() {
  const t = useTranslations("dashboard");
  const ordersCopy = useTranslations("orders");
  const { formatCurrency, formatDate } = useAppFormatters();
  const orders = useSWR("dashboard-latest", getLatestOrders);

  const columns = [
    {
      key: "id",
      label: ordersCopy("order"),
      render: (order: Order) => <Link href={`/orders/${order.id}`}>#{order.id}</Link>,
    },
    {
      key: "customer",
      label: ordersCopy("customer"),
      render: (order: Order) => order.customer_name,
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

  return (
    <section className={styles.latest}>
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("latestOrders")}</h2>
        <Link href="/orders" className={styles.sectionLink}>
          {t("viewAll")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>
      {orders.data ? (
        <EntityTable<Order>
          rows={orders.data.data}
          rowKey={(order) => order.id}
          total={orders.data.data.length}
          columns={columns}
        />
      ) : (
        <Panel>
          <DashboardState error={orders.error} onRetry={() => void orders.mutate()} />
        </Panel>
      )}
    </section>
  );
}

export function DashboardView() {
  const t = useTranslations("dashboard");
  const { formatCurrency, formatNumber } = useAppFormatters();
  const [range, setRange] = useState<AnalyticsRange>("month");
  const summary = useSWR("dashboard-summary", getSummary);
  const analytics = useSWR(
    ["dashboard-analytics", range],
    () => getAnalytics(range),
  );

  return (
    <div className={styles.page}>
      <PageHeader title={t("title")} description={t("description")} />

      {summary.data ? (
        <MetricCards
          summary={summary.data.data}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      ) : (
        <Panel>
          <DashboardState error={summary.error} onRetry={() => void summary.mutate()} />
        </Panel>
      )}

      <section className={styles.analytics}>
        <Panel as="article" className={styles.chart}>
          <PanelHeader
            title={t("salesAnalytics")}
            description={t("salesDescription")}
            actions={(
              <Segmented
                mode="group"
                size="sm"
                label={t("rangeLabel")}
                value={range}
                onChange={setRange}
                items={ranges.map((value) => ({ value, label: t(`ranges.${value}`) }))}
              />
            )}
          />
          {analytics.data?.data.length ? (
            <div className={styles.chartCanvas}>
              <SalesChart data={analytics.data.data} />
            </div>
          ) : analytics.data ? (
            <StatePanel state="empty" compact />
          ) : (
            <DashboardState error={analytics.error} onRetry={() => void analytics.mutate()} />
          )}
        </Panel>
        <TopProducts />
      </section>

      <LatestOrders />
    </div>
  );
}
