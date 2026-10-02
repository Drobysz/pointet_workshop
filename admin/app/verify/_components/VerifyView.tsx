"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
        <h1>{t("title")}</h1>
        <p>{t(messageKey)}</p>
        <Link href="/login">{t("goToLogin")}</Link>
      </section>
    </main>
  );
};
