"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { adminSchema } from "@/auth/FormSchemes";
import {
  Button,
  DetailList,
  EntityTable,
  Input,
  Modal,
  PageHeader,
  Panel,
  StatePanel,
} from "@/components";
import { useAppFormatters, useTableQueryState } from "@/hooks";
import type { User } from "@/interface/domain";
import { createAdmin, getUsers } from "@/queries";
import formStyles from "@/components/FormModal/form-modal.module.scss";

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

  function closeCreate() {
    setError("");
    setIsCreateOpen(false);
  }

  const header = (
    <PageHeader
      title={t("title")}
      description={t("accountDescription")}
      actions={(
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={17} aria-hidden="true" />
          {t("create")}
        </Button>
      )}
    />
  );

  if (admins.isLoading && !admins.data) {
    return <>{header}<Panel><StatePanel state="loading" /></Panel></>;
  }

  if (admins.error || !admins.data) {
    return (
      <>
        {header}
        <Panel>
          <StatePanel state="error" onRetry={() => void admins.mutate()} />
        </Panel>
      </>
    );
  }

  const columns = [
    {
      key: "name",
      label: t("administrator"),
      render: (admin: User) => (
        <button type="button" data-link onClick={() => setSelectedAdmin(admin)}>
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
        <Modal title={t("createTitle")} onClose={closeCreate}>
          <form action={handleCreate} className={formStyles.form}>
            <fieldset disabled={isSaving} className={formStyles.formFields}>
              <Input label={t("fullName")} name="full_name" required />
              <Input label={common("email")} name="email" type="email" required />
              <Input
                label={t("temporaryPassword")}
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </fieldset>
            {error ? <p className={formStyles.error} role="alert">{error}</p> : null}
            <div className={formStyles.actions}>
              <Button variant="secondary" disabled={isSaving} onClick={closeCreate}>
                {common("cancel")}
              </Button>
              <Button type="submit" variant="primary" pending={isSaving}>
                {isSaving ? common("creating") : t("create")}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {selectedAdmin ? (
        <Modal
          title={selectedAdmin.full_name}
          onClose={() => setSelectedAdmin(undefined)}
        >
          <DetailList
            items={[
              { key: "email", label: common("email"), value: selectedAdmin.email },
              { key: "role", label: t("role"), value: t("administrator") },
              {
                key: "verified",
                label: t("emailVerified"),
                value: selectedAdmin.email_verified_at
                  ? formatDate(selectedAdmin.email_verified_at)
                  : common("notYet"),
              },
              { key: "created", label: t("created"), value: formatDate(selectedAdmin.created_at) },
            ]}
          />
        </Modal>
      ) : null}
    </>
  );
}
