"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Button,
  DetailList,
  EntityTable,
  Modal,
  PageHeader,
  Panel,
  Segmented,
  Select,
  StatePanel,
  StatusBadge,
  Textarea,
} from "@/components";
import { useAppFormatters } from "@/hooks";
import type { SellerApplication, SellerApplicationStatus } from "@/interface/domain";
import { getSellerApplications, reviewSellerApplication } from "@/queries";
import styles from "./seller-applications-view.module.scss";

const statuses: SellerApplicationStatus[] = ["processing", "approved", "declined"];

const defaultApprovalMessage = "Здравствуйте!\nВаша заявка на присоединение к Workshop была одобрена.\nМы начинаем процесс регистрации вашего бренда на нашей платформе.\nВ ближайшее время наш менеджер свяжется с вами для передачи дальнейших инструкций и данных для входа.\nС уважением, команда Workshop.";
const rejectionTemplates = {
  retailer: "Здравствуйте!\nБлагодарим вас за интерес к Workshop.\nК сожалению, на данном этапе мы сотрудничаем непосредственно с производителями и брендами, а не с розничными продавцами.\nПоэтому сейчас мы не можем одобрить вашу заявку.\nС уважением, команда Workshop.",
  jurisdiction: "Здравствуйте!\nБлагодарим вас за интерес к Workshop.\nК сожалению, в настоящее время мы не можем начать сотрудничество в связи с действующими юридическими или санкционными ограничениями, применимыми к предполагаемому сотрудничеству.\nС уважением, команда Workshop.",
};

type ReviewMode = "details" | "approve" | "decline";
type RejectionReason = keyof typeof rejectionTemplates | "custom";

function ApplicationDetails({
  application,
  onClose,
  onReviewed,
}: {
  application: SellerApplication;
  onClose: () => void;
  onReviewed: () => void;
}) {
  const t = useTranslations("sellerApplications");
  const [mode, setMode] = useState<ReviewMode>("details");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(approved: boolean) {
    setPending(true);
    setFailed(false);

    try {
      await reviewSellerApplication(application.id, approved, message);
      onReviewed();
      onClose();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  function changeReason(reason: RejectionReason) {
    setMessage(reason === "custom" ? "" : rejectionTemplates[reason]);
  }

  const facts = [
    { key: "brand", label: t("brand"), value: application.brand_name },
    { key: "applicant", label: t("applicant"), value: `${application.first_name} ${application.last_name}` },
    { key: "email", label: t("email"), value: application.email },
    { key: "phone", label: t("phone"), value: application.tel_number },
    { key: "country", label: t("country"), value: application.country },
    { key: "address", label: t("companyAddress"), value: application.company_address },
    { key: "eu", label: t("euResident"), value: application.isResidentOfEU ? t("yes") : t("no") },
    { key: "contact", label: t("contactDescription"), value: application.description_of_contact },
    { key: "brandDescription", label: t("brandDescription"), value: application.description_of_brand },
  ];

  return (
    <Modal title={t("applicationTitle", { id: String(application.id) })} onClose={onClose}>
      <div className={styles.details}>
        {mode === "details" ? (
          <>
            <DetailList layout="stacked" items={facts} />
            {application.status === "processing" ? (
              <div className={styles.actions}>
                <Button
                  variant="primary"
                  onClick={() => {
                    setMessage(defaultApprovalMessage);
                    setMode("approve");
                  }}
                >
                  {t("approve")}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setMessage(rejectionTemplates.retailer);
                    setMode("decline");
                  }}
                >
                  {t("decline")}
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <>
            {mode === "decline" ? (
              <Select
                label={t("reason")}
                defaultValue="retailer"
                onChange={(event) => changeReason(event.target.value as RejectionReason)}
              >
                <option value="retailer">{t("reasons.retailer")}</option>
                <option value="jurisdiction">{t("reasons.jurisdiction")}</option>
                <option value="custom">{t("reasons.custom")}</option>
              </Select>
            ) : null}
            <Textarea
              label={t("response")}
              value={message}
              rows={10}
              onChange={(event) => setMessage(event.target.value)}
            />
            {failed ? <p className={styles.error} role="alert">{t("reviewError")}</p> : null}
            <div className={styles.actions}>
              <Button variant="secondary" disabled={pending} onClick={() => setMode("details")}>
                {t("back")}
              </Button>
              <Button
                variant={mode === "approve" ? "primary" : "danger"}
                pending={pending}
                disabled={!message.trim()}
                onClick={() => void submit(mode === "approve")}
              >
                {pending ? t("sending") : mode === "approve" ? t("sendApproval") : t("sendDecline")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export function SellerApplicationsView() {
  const t = useTranslations("sellerApplications");
  const { formatDate } = useAppFormatters();
  const [status, setStatus] = useState<SellerApplicationStatus>("processing");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SellerApplication | null>(null);
  const state = useSWR(
    ["seller-applications", page, status],
    () => getSellerApplications(page, status),
    { keepPreviousData: true },
  );

  const changeStatus = (next: SellerApplicationStatus) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <Segmented
        className={styles.tabs}
        label={t("title")}
        value={status}
        onChange={changeStatus}
        items={statuses.map((value) => ({ value, label: t(`tabs.${value}`) }))}
      />
      {state.isLoading && !state.data ? (
        <Panel><StatePanel state="loading" /></Panel>
      ) : null}
      {state.error || (!state.data && !state.isLoading) ? (
        <Panel>
          <StatePanel state="error" onRetry={() => void state.mutate()} />
        </Panel>
      ) : null}
      {state.data ? (
        <EntityTable<SellerApplication>
          rows={state.data.data}
          rowKey={(item) => item.id}
          total={state.data.meta.total}
          page={page}
          totalPages={state.data.meta.last_page}
          onPage={setPage}
          columns={[
            {
              key: "id",
              label: t("application"),
              render: (item) => (
                <button type="button" data-link onClick={() => setSelected(item)}>
                  #{item.id}
                </button>
              ),
            },
            { key: "brand", label: t("brand"), render: (item) => item.brand_name },
            {
              key: "applicant",
              label: t("applicant"),
              render: (item) => `${item.first_name} ${item.last_name}`,
            },
            { key: "country", label: t("country"), render: (item) => item.country },
            { key: "email", label: t("email"), render: (item) => item.email },
            { key: "date", label: t("created"), render: (item) => formatDate(item.created_at) },
            {
              key: "status",
              label: t("status"),
              render: (item) => <StatusBadge value={item.status} />,
            },
          ]}
        />
      ) : null}
      {selected ? (
        <ApplicationDetails
          application={selected}
          onClose={() => setSelected(null)}
          onReviewed={() => void state.mutate()}
        />
      ) : null}
    </>
  );
}
