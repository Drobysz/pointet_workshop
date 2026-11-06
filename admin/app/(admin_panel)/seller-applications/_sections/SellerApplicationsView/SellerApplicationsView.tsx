"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { EntityTable, Modal, PageHeader, StatePanel, StatusBadge } from "@/components";
import { useAppFormatters } from "@/hooks";
import type { SellerApplication, SellerApplicationStatus } from "@/interface/domain";
import { getSellerApplications, reviewSellerApplication } from "@/queries";
import styles from "./seller-applications-view.module.scss";

const defaultApprovalMessage = "Здравствуйте!\nВаша заявка на присоединение к Workshop была одобрена.\nМы начинаем процесс регистрации вашего бренда на нашей платформе.\nВ ближайшее время наш менеджер свяжется с вами для передачи дальнейших инструкций и данных для входа.\nС уважением, команда Workshop.";
const rejectionTemplates = {
  retailer: "Здравствуйте!\nБлагодарим вас за интерес к Workshop.\nК сожалению, на данном этапе мы сотрудничаем непосредственно с производителями и брендами, а не с розничными продавцами.\nПоэтому сейчас мы не можем одобрить вашу заявку.\nС уважением, команда Workshop.",
  jurisdiction: "Здравствуйте!\nБлагодарим вас за интерес к Workshop.\nК сожалению, в настоящее время мы не можем начать сотрудничество в связи с действующими юридическими или санкционными ограничениями, применимыми к предполагаемому сотрудничеству.\nС уважением, команда Workshop.",
};

function ApplicationDetails({ application, onClose, onReviewed }: { application: SellerApplication; onClose: () => void; onReviewed: () => void }) {
  const t = useTranslations("sellerApplications");
  const [mode, setMode] = useState<"details" | "approve" | "decline">("details");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(approved: boolean) {
    setPending(true); setFailed(false);
    try {
      await reviewSellerApplication(application.id, approved, message);
      onReviewed(); onClose();
    } catch { setFailed(true); } finally { setPending(false); }
  }

  return <Modal title={t("applicationTitle", { id: String(application.id) })} onClose={onClose}>
    <div className={styles.details}>
      {mode === "details" ? <>
        <dl>
          <div><dt>{t("brand")}</dt><dd>{application.brand_name}</dd></div>
          <div><dt>{t("applicant")}</dt><dd>{application.first_name} {application.last_name}</dd></div>
          <div><dt>{t("email")}</dt><dd>{application.email}</dd></div>
          <div><dt>{t("phone")}</dt><dd>{application.tel_number}</dd></div>
          <div><dt>{t("country")}</dt><dd>{application.country}</dd></div>
          <div><dt>{t("companyAddress")}</dt><dd>{application.company_address}</dd></div>
          <div><dt>{t("euResident")}</dt><dd>{application.isResidentOfEU ? t("yes") : t("no")}</dd></div>
          <div><dt>{t("contactDescription")}</dt><dd>{application.description_of_contact}</dd></div>
          <div><dt>{t("brandDescription")}</dt><dd>{application.description_of_brand}</dd></div>
        </dl>
        {application.status === "processing" ? <div className={styles.actions}><button type="button" className={styles.approve} onClick={() => { setMessage(defaultApprovalMessage); setMode("approve"); }}>{t("approve")}</button><button type="button" className={styles.decline} onClick={() => { setMessage(rejectionTemplates.retailer); setMode("decline"); }}>{t("decline")}</button></div> : null}
      </> : <>
        {mode === "decline" ? <label>{t("reason")}<select onChange={(event) => setMessage(event.target.value === "jurisdiction" ? rejectionTemplates.jurisdiction : event.target.value === "custom" ? "" : rejectionTemplates.retailer)}><option value="retailer">{t("reasons.retailer")}</option><option value="jurisdiction">{t("reasons.jurisdiction")}</option><option value="custom">{t("reasons.custom")}</option></select></label> : null}
        <label>{t("response")}<textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={10} /></label>
        {failed ? <p className={styles.error}>{t("reviewError")}</p> : null}
        <div className={styles.actions}><button type="button" onClick={() => setMode("details")}>{t("back")}</button><button type="button" className={mode === "approve" ? styles.approve : styles.decline} disabled={pending || !message.trim()} onClick={() => void submit(mode === "approve")}>{pending ? t("sending") : mode === "approve" ? t("sendApproval") : t("sendDecline")}</button></div>
      </>}
    </div>
  </Modal>;
}

export function SellerApplicationsView() {
  const t = useTranslations("sellerApplications");
  const { formatDate } = useAppFormatters();
  const [status, setStatus] = useState<SellerApplicationStatus>("processing");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SellerApplication | null>(null);
  const state = useSWR(["seller-applications", page, status], () => getSellerApplications(page, status), { keepPreviousData: true });
  const changeStatus = (next: SellerApplicationStatus) => { setStatus(next); setPage(1); };

  return <>
    <PageHeader title={t("title")} description={t("description")} />
    <div className={styles.tabs} role="tablist" aria-label={t("title")}>
      {(["processing", "approved", "declined"] as SellerApplicationStatus[]).map((item) => <button key={item} type="button" role="tab" aria-selected={status === item} onClick={() => changeStatus(item)}>{t(`tabs.${item}`)}</button>)}
    </div>
    {state.isLoading && !state.data ? <StatePanel state="loading" /> : null}
    {state.error || (!state.data && !state.isLoading) ? <StatePanel state="error" onRetry={() => void state.mutate()} /> : null}
    {state.data ? <EntityTable<SellerApplication>
      rows={state.data.data} rowKey={(item) => item.id} search="" total={state.data.meta.total} page={page} totalPages={state.data.meta.last_page} onSearch={() => undefined} onPage={setPage}
      columns={[
        { key: "id", label: t("application"), render: (item) => <button type="button" className={styles.rowButton} onClick={() => setSelected(item)}>#{item.id}</button> },
        { key: "brand", label: t("brand"), render: (item) => item.brand_name },
        { key: "applicant", label: t("applicant"), render: (item) => `${item.first_name} ${item.last_name}` },
        { key: "country", label: t("country"), render: (item) => item.country },
        { key: "email", label: t("email"), render: (item) => item.email },
        { key: "date", label: t("created"), render: (item) => formatDate(item.created_at) },
        { key: "status", label: t("status"), render: (item) => <StatusBadge value={item.status} /> },
      ]}
    /> : null}
    {selected ? <ApplicationDetails application={selected} onClose={() => setSelected(null)} onReviewed={() => void state.mutate()} /> : null}
  </>;
}
