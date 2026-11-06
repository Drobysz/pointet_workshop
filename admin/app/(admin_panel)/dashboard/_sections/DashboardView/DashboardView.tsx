"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { PageHeader, StatePanel, StatusBadge } from "@/components";
import { useAppFormatters } from "@/hooks";
import type { DashboardSummary } from "@/interface/domain";
import {
  getAnalytics,
  getLatestOrders,
  getSummary,
  getTopProducts,
} from "@/queries";
import styles from "./dashboard-view.module.scss";

const SalesChart = dynamic(() => import("./SalesChart"), {
  loading: () => <StatePanel state="loading" />,
});

function DashboardState({ error, onRetry }: {
  error: unknown;
  onRetry: () => void;
}) {
  return <StatePanel state={error ? "error" : "loading"} onRetry={onRetry} />;
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
  const t = useTranslations("dashboard.metrics");
  const cards = [
    { label: t("users"), value: formatNumber(summary.users) },
    { label: t("revenue"), value: formatCurrency(summary.monthly_revenue) },
    { label: t("orders"), value: formatNumber(summary.orders) },
  ];

  return (
    <section className={styles.metrics}>
      {cards.map((card) => (
        <article key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
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
    <aside className={styles.top}>
      <h2>{t("topProducts")}</h2>
      <div>
        {items?.length ? (
          items.map((product, index) => (
            <Link
              href={product.good_id ? `/goods/${product.good_id}` : "/goods"}
              key={`${product.good_id}-${product.product_name}`}
            >
              <span>{index + 1}</span>
              <div>
                <strong>{product.product_name}</strong>
                <small>
                  {t("units", { count: product.units })} ·{` `}
                  {formatCurrency(product.revenue)}
                </small>
              </div>
              <ArrowUpRight size={16} />
            </Link>
          ))
        ) : items ? <StatePanel state="empty" /> : (
          <DashboardState error={products.error} onRetry={() => void products.mutate()} />
        )}
      </div>
    </aside>
  );
}

function LatestOrders() {
  const t = useTranslations("dashboard");
  const ordersCopy = useTranslations("orders");
  const { formatCurrency, formatDate } = useAppFormatters();
  const orders = useSWR("dashboard-latest", getLatestOrders);

  return (
    <section className={styles.latest}>
      <header>
        <h2>{t("latestOrders")}</h2>
        <Link href="/orders">{t("viewAll")}</Link>
      </header>
      {orders.data ? (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>{ordersCopy("order")}</th>
                <th>{ordersCopy("customer")}</th>
                <th>{ordersCopy("status")}</th>
                <th>{ordersCopy("placedColumn")}</th>
                <th>{ordersCopy("total")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.data.map((order) => (
                <tr key={order.id}>
                  <td><Link href={`/orders/${order.id}`}>#{order.id}</Link></td>
                  <td>{order.customer_name}</td>
                  <td><StatusBadge value={order.status} /></td>
                  <td>{formatDate(order.placed_at)}</td>
                  <td>{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <DashboardState error={orders.error} onRetry={() => void orders.mutate()} />
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
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      {summary.data ? (
        <MetricCards
          summary={summary.data.data}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      ) : (
        <DashboardState error={summary.error} onRetry={() => void summary.mutate()} />
      )}

      <section className={styles.analytics}>
        <article className={styles.chart}>
          <header>
            <div>
              <h2>{t("salesAnalytics")}</h2>
              <p>{t("salesDescription")}</p>
            </div>
            <div className={styles.range}>
              {ranges.map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={range === value}
                  onClick={() => setRange(value)}
                >
                  {t(`ranges.${value}`)}
                </button>
              ))}
            </div>
          </header>

          {analytics.data?.data.length ? (
            <div className={styles.chartCanvas}>
              <SalesChart data={analytics.data.data} />
            </div>
          ) : analytics.data ? <StatePanel state="empty" /> : (
            <DashboardState error={analytics.error} onRetry={() => void analytics.mutate()} />
          )}
        </article>
        <TopProducts />
      </section>

      <LatestOrders />
    </div>
  );
}
