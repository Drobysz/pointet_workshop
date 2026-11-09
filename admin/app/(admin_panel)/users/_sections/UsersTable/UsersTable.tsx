"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Button,
  EntityTable,
  PageHeader,
  Panel,
  StatePanel,
} from "@/components";
import { useAppFormatters, useTableQueryState } from "@/hooks";
import type { User } from "@/interface/domain";
import { getUsers } from "@/queries";
import { UserFormModal } from "../UserFormModal/UserFormModal";

export function UsersTable() {
  const t = useTranslations("users");
  const common = useTranslations("common");
  const { formatDate } = useAppFormatters();
  const tableState = useTableQueryState();
  const [editingUser, setEditingUser] = useState<User | "new">();
  const users = useSWR(
    ["users", tableState.page, tableState.searchQuery],
    () => getUsers(tableState.page, tableState.searchQuery),
    { keepPreviousData: true },
  );

  const header = (
    <PageHeader
      title={t("title")}
      description={t("description")}
      actions={(
        <Button variant="primary" onClick={() => setEditingUser("new")}>
          <Plus size={17} aria-hidden="true" />
          {t("create")}
        </Button>
      )}
    />
  );

  if (users.isLoading && !users.data) {
    return <>{header}<Panel><StatePanel state="loading" /></Panel></>;
  }

  if (users.error || !users.data) {
    return (
      <>
        {header}
        <Panel>
          <StatePanel state="error" onRetry={() => void users.mutate()} />
        </Panel>
      </>
    );
  }

  const columns = [
    {
      key: "name",
      label: t("customer"),
      render: (user: User) => (
        <Link href={`/users/${user.id}`}>{user.full_name}</Link>
      ),
    },
    {
      key: "email",
      label: common("email"),
      render: (user: User) => user.email,
    },
    {
      key: "verified",
      label: t("verified"),
      render: (user: User) => (
        user.email_verified_at ? common("yes") : common("no")
      ),
    },
    {
      key: "joined",
      label: t("joined"),
      render: (user: User) => formatDate(user.created_at),
    },
    {
      key: "actions",
      label: common("actions"),
      align: "right" as const,
      render: (user: User) => (
        <Button
          variant="ghost"
          icon
          size="sm"
          aria-label={t("editLabel", { name: user.full_name })}
          onClick={() => setEditingUser(user)}
        >
          <Pencil size={15} aria-hidden="true" />
        </Button>
      ),
    },
  ];

  const hasNoUsers = !users.data.data.length && !tableState.searchQuery;

  return (
    <>
      {header}
      {hasNoUsers ? (
        <Panel><StatePanel state="empty" /></Panel>
      ) : (
        <EntityTable<User>
          rows={users.data.data}
          rowKey={(user) => user.id}
          search={tableState.searchInput}
          page={users.data.meta.current_page}
          totalPages={users.data.meta.last_page}
          total={users.data.meta.total}
          onSearch={tableState.setSearchInput}
          onPage={tableState.setPage}
          columns={columns}
        />
      )}
      {editingUser ? (
        <UserFormModal
          user={editingUser === "new" ? undefined : editingUser}
          onClose={() => setEditingUser(undefined)}
          onSaved={async () => {
            await users.mutate();
          }}
        />
      ) : null}
    </>
  );
}
