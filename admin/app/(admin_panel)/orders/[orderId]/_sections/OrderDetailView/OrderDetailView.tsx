"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  DetailList,
  PageHeader,
  Panel,
  PanelHeader,
  StatePanel,
  StatusBadge,
} from "@/components";
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
    return <Panel><StatePanel state="loading" /></Panel>;
  }

  if (orderState.error || !orderState.data) {
    return (
      <Panel>
        <StatePanel state="error" onRetry={() => void orderState.mutate()} />
      </Panel>
    );
  }

  const order = orderState.data.data;
  const items = order.items ?? [];

  return (
    <>
      <PageHeader
        title={t("orderTitle", { id: String(order.id) })}
        description={t("placed", { date: formatDate(order.placed_at) })}
        actions={<StatusBadge value={order.status} />}
        back={{ href: "/orders", label: t("back") }}
      />

      <div className={styles.grid}>
        <Panel className={styles.items}>
          <PanelHeader
            title={t("items")}
            description={t("itemsCount", { count: items.length })}
          />
          <ul className={styles.itemList}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.thumb} aria-hidden="true">
                  {item.product_name.slice(0, 1)}
                </span>
                <span className={styles.product}>
                  <Link href={item.good_id ? `/goods/${item.good_id}` : "/goods"}>
                    {item.product_name}
                  </Link>
                  <span className={styles.meta}>
                    {item.color_name ?? t("colorDefault")} ·{` `}
                    {item.size ? `${item.size} · ` : ""}
                    {t("unitPrice", { price: formatCurrency(item.unit_price) })}
                  </span>
                </span>
                <span className={styles.quantity}>× {item.quantity}</span>
                <strong className={styles.lineTotal}>
                  {formatCurrency(item.line_total)}
                </strong>
              </li>
            ))}
          </ul>
        </Panel>

        <div className={styles.aside}>
          <Panel>
            <PanelHeader title={t("customer")} />
            <div className={styles.customer}>
              {order.customer ? (
                <Link href={`/users/${order.customer.id}`} className={styles.customerLink}>
                  {order.customer.full_name}
                </Link>
              ) : (
                <strong>{order.customer_name}</strong>
              )}
              <span className={styles.meta}>{order.customer_email}</span>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title={t("summary")} />
            <DetailList
              items={[
                { key: "subtotal", label: t("subtotal"), value: formatCurrency(order.total) },
                { key: "shipping", label: t("shipping"), value: "—" },
              ]}
            />
            <div className={styles.total}>
              <span>{t("total")}</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
