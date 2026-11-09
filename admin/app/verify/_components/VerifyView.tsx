"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ButtonLink, Spinner } from "@/components";
import { verifyAccount } from "@/queries";
import styles from "./VerifyView.module.scss";

export const VerifyView = ({ token }: { token: string }) => {
  const t = useTranslations("verify");
  const hasSubmitted = useRef(false);
  const [messageKey, setMessageKey] = useState<
    "confirming" | "incomplete" | "confirmed" | "invalid"
  >(token ? "confirming" : "incomplete");

  useEffect(() => {
    if (!token || hasSubmitted.current) {
      return;
    }
    hasSubmitted.current = true;

    verifyAccount(token).then(
      () => setMessageKey("confirmed"),
      () => setMessageKey("invalid"),
    );
  }, [token]);

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-live="polite">
        <span className={styles.wordmark} aria-hidden="true">Pointet</span>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.message}>
          {messageKey === "confirming" ? <Spinner size={16} /> : null}
          {t(messageKey)}
        </p>
        <ButtonLink href="/login" variant="primary">
          {t("goToLogin")}
        </ButtonLink>
      </section>
    </main>
  );
};
