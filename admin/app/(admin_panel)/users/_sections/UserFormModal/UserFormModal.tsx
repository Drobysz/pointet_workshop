"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { userSchema } from "@/auth/FormSchemes";
import { Modal } from "@/components";
import type { User, UserPayload } from "@/interface/domain";
import { createUser, updateUser } from "@/queries";
import styles from "@/components/FormModal/form-modal.module.scss";

interface UserFormModalProps {
  user?: User;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

function buildUserPayload(formData: FormData): UserPayload | null {
  const parsed = userSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return null;
  }

  const payload: UserPayload = {
    full_name: parsed.data.full_name,
    email: parsed.data.email,
  };

  if (parsed.data.password) {
    payload.password = parsed.data.password;
  }

  return payload;
}

export function UserFormModal({
  user,
  onClose,
  onSaved,
}: UserFormModalProps) {
  const t = useTranslations("users");
  const common = useTranslations("common");
  const validation = useTranslations("validation");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(user);

  async function handleSubmit(formData: FormData) {
    setError("");

    const payload = buildUserPayload(formData);

    if (!payload || (!isEditing && !payload.password)) {
      setError(validation("checkForm"));
      return;
    }

    setIsSaving(true);

    try {
      if (user) {
        await updateUser(user.id, payload);
      } else {
        await createUser(payload);
      }

      await onSaved();
      onClose();
    } catch {
      setError(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={isEditing ? t("editTitle") : t("createTitle")}
      onClose={onClose}
    >
      <form action={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          {t("form.fullName")}
          <input
            name="full_name"
            defaultValue={user?.full_name ?? ""}
            maxLength={255}
            required
          />
        </label>

        <label className={styles.field}>
          {t("form.email")}
          <input
            name="email"
            type="email"
            defaultValue={user?.email ?? ""}
            autoComplete="email"
            required
          />
        </label>

        <label className={styles.field}>
          {t("form.password")}
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required={!isEditing}
          />
          <small>
            {isEditing
              ? t("form.passwordEditHint")
              : t("form.passwordCreateHint")}
          </small>
        </label>

        {error ? <p className={styles.error} role="alert">{error}</p> : null}

        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            {common("cancel")}
          </button>
          <button type="submit" disabled={isSaving}>
            {isSaving ? common("saving") : common("save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
