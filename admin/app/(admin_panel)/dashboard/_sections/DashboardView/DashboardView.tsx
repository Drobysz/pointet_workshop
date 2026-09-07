"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useSWR from "swr";
import { PageHeader, StatePanel, StatusBadge } from "@/components";
import { useAppFormatters } from "@/hooks";
import type {
  ApiEntity,
  DashboardSummary,
  Order,
  TopProduct,
} from "@/interface/domain";
import {
  getAnalytics,
  getLatestOrders,
  getSummary,
  getTopProducts,
} from "@/queries";
import styles from "./dashboard-view.module.scss";

const ranges = ["week", "month", "6months", "year"] as const;
type AnalyticsRange = (typeof ranges)[number];

interface MetricCardsProps {
  summary: DashboardSummary;
  formatCurrency: (value: string | number) => string;
}

function MetricCards({ summary, formatCurrency }: MetricCardsProps) {
  const t = useTranslations("dashboard.metrics");
  const cards = [
    { label: t("users"), value: summary.users },
    { label: t("revenue"), value: formatCurrency(summary.monthly_revenue) },
    { label: t("orders"), value: summary.orders },
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

function TopProducts({ products }: { products: TopProduct[] }) {
  const t = useTranslations("dashboard");
  const { formatCurrency } = useAppFormatters();

  return (
    <aside className={styles.top}>
      <h2>{t("topProducts")}</h2>
      <div>
        {products.length ? products.map((product, index) => (
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
        )) : <StatePanel state="empty" />}
      </div>
    </aside>
  );
}

function LatestOrders({ orders }: { orders: Order[] }) {
  const t = useTranslations("dashboard");
  const ordersCopy = useTranslations("orders");
  const { formatCurrency, formatDate } = useAppFormatters();

  return (
    <section className={styles.latest}>
      <header>
        <h2>{t("latestOrders")}</h2>
        <Link href="/orders">{t("viewAll")}</Link>
      </header>
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
            {orders.map((order) => (
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
    </section>
  );
}

export function DashboardView() {
  const t = useTranslations("dashboard");
  const { formatCurrency } = useAppFormatters();
  const [range, setRange] = useState<AnalyticsRange>("month");
  const summary = useSWR("dashboard-summary", getSummary);
  const analytics = useSWR(
    ["dashboard-analytics", range],
    () => getAnalytics(range),
  );
  const topProducts = useSWR("dashboard-top", getTopProducts);
  const latestOrders = useSWR("dashboard-latest", getLatestOrders);

  const isLoading = summary.isLoading
    || analytics.isLoading
    || topProducts.isLoading
    || latestOrders.isLoading;
  const hasError = summary.error
    || analytics.error
    || topProducts.error
    || latestOrders.error;
  const hasAllData = summary.data
    && analytics.data
    && topProducts.data
    && latestOrders.data;

  if (isLoading) {
    return <><PageHeader title={t("title")} /><StatePanel state="loading" /></>;
  }

  if (hasError || !hasAllData) {
    return (
      <>
        <PageHeader title={t("title")} />
        <StatePanel
          state="error"
          onRetry={() => {
            void summary.mutate();
            void analytics.mutate();
            void topProducts.mutate();
            void latestOrders.mutate();
          }}
        />
      </>
    );
  }

  const summaryData = summary.data as ApiEntity<DashboardSummary>;
  const analyticsData = analytics.data!;
  const topProductData = topProducts.data!;
  const latestOrderData = latestOrders.data!;

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <MetricCards
        summary={summaryData.data}
        formatCurrency={formatCurrency}
      />

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

          {analyticsData.data.length ? (
            <div className={styles.chartCanvas}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.data}>
                  <CartesianGrid stroke="#e8e8ed" vertical={false} />
                  <XAxis dataKey="bucket" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0071e3"
                    strokeWidth={2}
                    fill="#0071e3"
                    fillOpacity={0.12}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <StatePanel state="empty" />}
        </article>
        <TopProducts products={topProductData.data} />
      </section>

      <LatestOrders orders={latestOrderData.data} />
    </div>
  );
}
