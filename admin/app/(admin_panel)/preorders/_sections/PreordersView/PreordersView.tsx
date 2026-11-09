"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  DetailList,
  EntityTable,
  Modal,
  PageHeader,
  Panel,
  Segmented,
  StatePanel,
  StatusBadge,
} from "@/components";
import { useAppFormatters } from "@/hooks";
import type { Preorder, PreorderAnalyticsItem } from "@/interface/domain";
import { getPreorder, getPreorderAnalytics, getPreorders } from "@/queries";
import styles from "./preorders-view.module.scss";

type View = "preorders" | "analytics";

const views: View[] = ["preorders", "analytics"];

function PaymentAmount({ preorder }: { preorder: Preorder }) {
  const { formatCurrency } = useAppFormatters();

  return (
    <span>
      {formatCurrency(preorder.payment_amount_cents / 100, preorder.currency)}
    </span>
  );
}

function PreorderList() {
  const t = useTranslations("preorders");
  const { formatDate } = useAppFormatters();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Preorder | null>(null);
  const state = useSWR(
    ["preorders", page, search],
    () => getPreorders(page, search),
    { keepPreviousData: true },
  );

  if (state.isLoading && !state.data) {
    return <Panel><StatePanel state="loading" /></Panel>;
  }

  if (state.error || !state.data) {
    return (
      <Panel>
        <StatePanel state="error" onRetry={() => void state.mutate()} />
      </Panel>
    );
  }

  return (
    <>
      <EntityTable<Preorder>
        rows={state.data.data}
        rowKey={(preorder) => preorder.id}
        search={search}
        total={state.data.meta.total}
        page={page}
        totalPages={state.data.meta.last_page}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onPage={setPage}
        columns={[
          {
            key: "id",
            label: t("preorder"),
            render: (preorder) => (
              <button type="button" data-link onClick={() => setSelected(preorder)}>
                #{preorder.id}
              </button>
            ),
          },
          {
            key: "customer",
            label: t("customer"),
            render: (preorder) => (
              <span className={styles.customer}>
                {preorder.customer_name}
                <small>{preorder.customer_email}</small>
              </span>
            ),
          },
          {
            key: "status",
            label: t("paymentStatus"),
            render: (preorder) => <StatusBadge value={preorder.payment_status} />,
          },
          {
            key: "date",
            label: t("created"),
            render: (preorder) => formatDate(preorder.created_at),
          },
          {
            key: "amount",
            label: t("amount"),
            align: "right",
            render: (preorder) => <PaymentAmount preorder={preorder} />,
          },
        ]}
      />
      {selected ? (
        <PreorderDetails preorder={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}

function PreorderDetails({
  preorder,
  onClose,
}: {
  preorder: Preorder;
  onClose: () => void;
}) {
  const t = useTranslations("preorders");
  const { formatCurrency } = useAppFormatters();
  const detail = useSWR(["preorder", preorder.id], () => getPreorder(preorder.id));
  const value = detail.data?.data ?? preorder;

  return (
    <Modal title={t("preorderTitle", { id: String(preorder.id) })} onClose={onClose}>
      {detail.error ? (
        <StatePanel state="error" compact onRetry={() => void detail.mutate()} />
      ) : (
        <div className={styles.details}>
          <DetailList
            items={[
              {
                key: "customer",
                label: t("customer"),
                value: `${value.customer_name} · ${value.customer_email}`,
              },
              {
                key: "status",
                label: t("paymentStatus"),
                value: <StatusBadge value={value.payment_status} />,
              },
              {
                key: "amount",
                label: t("amount"),
                value: <PaymentAmount preorder={value} />,
              },
            ]}
          />

          <h3 className={styles.detailsTitle}>{t("products")}</h3>
          {detail.isLoading ? (
            <StatePanel state="loading" compact />
          ) : (
            <ul className={styles.registers}>
              {value.registers?.map((register) => (
                <li key={register.id} className={styles.register}>
                  <strong>{register.product_name}</strong>
                  <span>
                    {register.color_name ?? "—"} · {register.size ?? "—"} ·{` `}
                    {register.quantity} × {formatCurrency(register.original_unit_price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}

function AnalyticsList() {
  const t = useTranslations("preorders");
  const { formatCurrency, formatNumber } = useAppFormatters();
  const [page, setPage] = useState(1);
  const state = useSWR(
    ["preorder-analytics", page],
    () => getPreorderAnalytics(page),
    { keepPreviousData: true },
  );

  if (state.isLoading && !state.data) {
    return <Panel><StatePanel state="loading" /></Panel>;
  }

  if (state.error || !state.data) {
    return (
      <Panel>
        <StatePanel state="error" onRetry={() => void state.mutate()} />
      </Panel>
    );
  }

  return (
    <EntityTable<PreorderAnalyticsItem>
      rows={state.data.data}
      rowKey={(item) => item.product_id}
      total={state.data.meta.total}
      page={page}
      totalPages={state.data.meta.last_page}
      onPage={setPage}
      columns={[
        {
          key: "product",
          label: t("product"),
          render: (item) => (
            <span className={styles.product}>
              {item.image_url ? (
                <Image src={item.image_url} alt="" width={40} height={40} unoptimized />
              ) : (
                <span className={styles.productPlaceholder} aria-hidden="true" />
              )}
              <strong>{item.product_name}</strong>
            </span>
          ),
        },
        {
          key: "price",
          label: t("originalPrice"),
          align: "right",
          render: (item) => formatCurrency(item.original_price),
        },
        {
          key: "quantity",
          label: t("preorderedQuantity"),
          align: "right",
          render: (item) => formatNumber(item.preordered_quantity),
        },
      ]}
    />
  );
}

export function PreordersView() {
  const t = useTranslations("preorders");
  const [view, setView] = useState<View>("preorders");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <Segmented
        className={styles.tabs}
        label={t("title")}
        value={view}
        onChange={setView}
        items={views.map((value) => ({ value, label: t(`tabs.${value}`) }))}
      />
      <div hidden={view !== "preorders"}><PreorderList /></div>
      <div hidden={view !== "analytics"}><AnalyticsList /></div>
    </>
  );
}
