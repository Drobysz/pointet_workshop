"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { PageHeader, StatePanel, StatusBadge } from "@/components";
import { useAppFormatters } from "@/hooks";
import { getOrder } from "@/queries";
import styles from "./order-detail-view.module.scss";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const t = useTranslations("orders");
  const { formatCurrency, formatDate } = useAppFormatters();
  const orderState = useSWR(
    ["order", orderId],
    () => getOrder(orderId),
  );

  if (orderState.isLoading) {
    return <StatePanel state="loading" />;
  }

  if (orderState.error || !orderState.data) {
    return (
      <StatePanel
        state="error"
        onRetry={() => void orderState.mutate()}
      />
    );
  }

  const order = orderState.data.data;

  return (
    <>
      <Link href="/orders" className={styles.back}>
        <ArrowLeft size={16} />
        {t("all")}
      </Link>
      <PageHeader
        title={t("orderTitle", { id: String(order.id) })}
        description={t("placed", { date: formatDate(order.placed_at) })}
        actions={<StatusBadge value={order.status} />}
      />

      <div className={styles.grid}>
        <section className={styles.items}>
          <h2>{t("items")}</h2>
          {order.items?.map((item) => (
            <article key={item.id}>
              <div className={styles.thumb}>
                {item.product_name.slice(0, 1)}
              </div>
              <div className={styles.product}>
                <Link
                  href={item.good_id ? `/goods/${item.good_id}` : "/goods"}
                >
                  {item.product_name}
                </Link>
                <span>
                  {item.color_name ?? t("colorDefault")} ·{` `}
                  {item.size ? `${item.size} · ` : ""}
                  {t("unitPrice", { price: formatCurrency(item.unit_price) })}
                </span>
              </div>
              <span>× {item.quantity}</span>
              <strong>{formatCurrency(item.line_total)}</strong>
            </article>
          ))}
        </section>

        <aside>
          <section className={styles.customer}>
            <h2>{t("customer")}</h2>
            {order.customer ? (
              <Link href={`/users/${order.customer.id}`}>
                {order.customer.full_name}
              </Link>
            ) : (
              <strong>{order.customer_name}</strong>
            )}
            <span>{order.customer_email}</span>
          </section>

          <section className={styles.summary}>
            <h2>{t("summary")}</h2>
            <div>
              <span>{t("subtotal")}</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
            <div>
              <span>{t("shipping")}</span>
              <strong>—</strong>
            </div>
            <div className={styles.total}>
              <span>{t("total")}</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
