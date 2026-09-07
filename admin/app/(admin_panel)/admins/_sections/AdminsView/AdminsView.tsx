"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { adminSchema } from "@/auth/FormSchemes";
import { EntityTable, Modal, PageHeader, StatePanel } from "@/components";
import { useAppFormatters, useTableQueryState } from "@/hooks";
import type { User } from "@/interface/domain";
import { createAdmin, getUsers } from "@/queries";
import styles from "./admins-view.module.scss";

export function AdminsView() {
  const t = useTranslations("admins");
  const common = useTranslations("common");
  const validation = useTranslations("validation");
  const { formatDate } = useAppFormatters();
  const tableState = useTableQueryState();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User>();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const admins = useSWR(
    ["admins", tableState.page, tableState.searchQuery],
    () => getUsers(tableState.page, tableState.searchQuery, "admin"),
    { keepPreviousData: true },
  );

  async function handleCreate(formData: FormData) {
    setError("");
    const result = adminSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      setError(validation("checkForm"));
      return;
    }

    setIsSaving(true);

    try {
      await createAdmin(result.data);
      await admins.mutate();
      setIsCreateOpen(false);
    } catch {
      setError(t("createError"));
    } finally {
      setIsSaving(false);
    }
  }

  const header = (
    <PageHeader
      title={t("title")}
      description={t("accountDescription")}
      actions={(
        <button
          className={styles.primary}
          type="button"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={17} />
          {t("create")}
        </button>
      )}
    />
  );

  if (admins.isLoading && !admins.data) {
    return <>{header}<StatePanel state="loading" /></>;
  }

  if (admins.error || !admins.data) {
    return (
      <>
        {header}
        <StatePanel state="error" onRetry={() => void admins.mutate()} />
      </>
    );
  }

  const columns = [
    {
      key: "name",
      label: t("administrator"),
      render: (admin: User) => (
        <button
          type="button"
          data-link
          onClick={() => setSelectedAdmin(admin)}
        >
          {admin.full_name}
        </button>
      ),
    },
    {
      key: "email",
      label: common("email"),
      render: (admin: User) => admin.email,
    },
    {
      key: "verified",
      label: t("verified"),
      render: (admin: User) => (
        admin.email_verified_at ? common("yes") : common("no")
      ),
    },
    {
      key: "created",
      label: t("created"),
      render: (admin: User) => formatDate(admin.created_at),
    },
  ];

  return (
    <>
      {header}
      <EntityTable<User>
        rows={admins.data.data}
        rowKey={(admin) => admin.id}
        search={tableState.searchInput}
        page={admins.data.meta.current_page}
        totalPages={admins.data.meta.last_page}
        total={admins.data.meta.total}
        onSearch={tableState.setSearchInput}
        onPage={tableState.setPage}
        columns={columns}
      />

      {isCreateOpen ? (
        <Modal title={t("createTitle")} onClose={() => setIsCreateOpen(false)}>
          <form action={handleCreate} className={styles.form}>
            <label>
              {t("fullName")}
              <input name="full_name" required />
            </label>
            <label>
              {common("email")}
              <input name="email" type="email" required />
            </label>
            <label>
              {t("temporaryPassword")}
              <input name="password" type="password" minLength={12} required />
            </label>
            {error ? <p role="alert">{error}</p> : null}
            <button type="submit" disabled={isSaving}>
              {isSaving ? common("creating") : t("create")}
            </button>
          </form>
        </Modal>
      ) : null}

      {selectedAdmin ? (
        <Modal
          title={selectedAdmin.full_name}
          onClose={() => setSelectedAdmin(undefined)}
        >
          <dl className={styles.details}>
            <div>
              <dt>{common("email")}</dt>
              <dd>{selectedAdmin.email}</dd>
            </div>
            <div>
              <dt>{t("role")}</dt>
              <dd>{t("administrator")}</dd>
            </div>
            <div>
              <dt>{t("emailVerified")}</dt>
              <dd>
                {selectedAdmin.email_verified_at
                  ? formatDate(selectedAdmin.email_verified_at)
                  : common("notYet")}
              </dd>
            </div>
            <div>
              <dt>{t("created")}</dt>
              <dd>{formatDate(selectedAdmin.created_at)}</dd>
            </div>
          </dl>
        </Modal>
      ) : null}
    </>
  );
}
