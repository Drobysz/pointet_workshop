"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { EntityTable, Modal, PageHeader, StatePanel, StatusBadge } from "@/components";
import { useAppFormatters } from "@/hooks";
import type { Preorder, PreorderAnalyticsItem } from "@/interface/domain";
import { getPreorderAnalytics, getPreorders } from "@/queries";
import styles from "./preorders-view.module.scss";

type View = "preorders" | "analytics";

function PaymentAmount({ preorder }: { preorder: Preorder }) {
  return <span>{(preorder.payment_amount_cents / 100).toFixed(2)} {preorder.currency.toUpperCase()}</span>;
}

function PreorderList() {
  const t = useTranslations("preorders");
  const { formatDate } = useAppFormatters();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Preorder | null>(null);
  const state = useSWR(["preorders", page, search], () => getPreorders(page, search), { keepPreviousData: true });

  if (state.isLoading && !state.data) return <StatePanel state="loading" />;
  if (state.error || !state.data) return <StatePanel state="error" onRetry={() => void state.mutate()} />;

  return (
    <>
      <EntityTable<Preorder>
        rows={state.data.data}
        rowKey={(preorder) => preorder.id}
        search={search}
        total={state.data.meta.total}
        page={page}
        totalPages={state.data.meta.last_page}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        onPage={setPage}
        columns={[
          { key: "id", label: t("preorder"), render: (preorder) => <button type="button" className={styles.rowButton} onClick={() => setSelected(preorder)}>#{preorder.id}</button> },
          { key: "customer", label: t("customer"), render: (preorder) => <span>{preorder.customer_name}<br /><small>{preorder.customer_email}</small></span> },
          { key: "status", label: t("paymentStatus"), render: (preorder) => <StatusBadge value={preorder.payment_status} /> },
          { key: "date", label: t("created"), render: (preorder) => formatDate(preorder.created_at) },
          { key: "amount", label: t("amount"), align: "right", render: (preorder) => <PaymentAmount preorder={preorder} /> },
        ]}
      />
      {selected ? <PreorderDetails preorder={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

function PreorderDetails({ preorder, onClose }: { preorder: Preorder; onClose: () => void }) {
  const t = useTranslations("preorders");
  const { formatCurrency } = useAppFormatters();
  const detail = useSWR(["preorder", preorder.id], () => import("@/queries").then(({ getPreorder }) => getPreorder(preorder.id)));
  const value = detail.data?.data ?? preorder;

  return <Modal title={`${t("preorder")} #${preorder.id}`} onClose={onClose}>
    {detail.error ? <StatePanel state="error" onRetry={() => void detail.mutate()} /> : (
      <div className={styles.details}>
        <p><strong>{t("customer")}:</strong> {value.customer_name} · {value.customer_email}</p>
        <p><strong>{t("paymentStatus")}:</strong> <StatusBadge value={value.payment_status} /></p>
        <p><strong>{t("amount")}:</strong> <PaymentAmount preorder={value} /></p>
        <h3>{t("products")}</h3>
        {detail.isLoading ? <p>{t("loading")}</p> : value.registers?.map((register) => <article key={register.id}><strong>{register.product_name}</strong><span>{register.color_name ?? "—"} · {register.size ?? "—"} · {register.quantity} × {formatCurrency(register.original_unit_price)}</span></article>)}
      </div>
    )}
  </Modal>;
}

function AnalyticsList() {
  const t = useTranslations("preorders");
  const { formatCurrency } = useAppFormatters();
  const [page, setPage] = useState(1);
  const state = useSWR(["preorder-analytics", page], () => getPreorderAnalytics(page), { keepPreviousData: true });
  if (state.isLoading && !state.data) return <StatePanel state="loading" />;
  if (state.error || !state.data) return <StatePanel state="error" onRetry={() => void state.mutate()} />;

  return <EntityTable<PreorderAnalyticsItem>
    rows={state.data.data}
    rowKey={(item) => item.product_id}
    search=""
    total={state.data.meta.total}
    page={page}
    totalPages={state.data.meta.last_page}
    onSearch={() => undefined}
    onPage={setPage}
    columns={[
      { key: "product", label: t("product"), render: (item) => <span className={styles.product}>{item.image_url ? <img src={item.image_url} alt="" /> : null}<strong>{item.product_name}</strong></span> },
      { key: "price", label: t("originalPrice"), align: "right", render: (item) => formatCurrency(item.original_price) },
      { key: "quantity", label: t("preorderedQuantity"), align: "right", render: (item) => item.preordered_quantity },
    ]}
  />;
}

export function PreordersView() {
  const t = useTranslations("preorders");
  const [view, setView] = useState<View>("preorders");
  return <>
    <PageHeader title={t("title")} description={t("description")} />
    <div className={styles.tabs} role="tablist" aria-label={t("title")}>
      <button type="button" role="tab" aria-selected={view === "preorders"} onClick={() => setView("preorders")}>{t("tabs.preorders")}</button>
      <button type="button" role="tab" aria-selected={view === "analytics"} onClick={() => setView("analytics")}>{t("tabs.analytics")}</button>
    </div>
    <div hidden={view !== "preorders"}><PreorderList /></div>
    <div hidden={view !== "analytics"}><AnalyticsList /></div>
  </>;
}
