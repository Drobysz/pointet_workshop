"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginSchema } from "@/auth/FormSchemes";
import { login } from "@/queries";
import styles from "./login-form.module.scss";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");

    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      setError(t("validation"));
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login(result.data);

      if (session.data.user.role !== "admin") {
        setError(t("adminOnly"));
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError(t("emailOrPasswordIncorrect"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.wrapper}>
      <form action={handleSubmit}>
        <div>
          <h2>{t("title")}</h2>
          <p>{t("subtitle")}</p>
        </div>
        <label>
          {t("email")}
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          {t("password")}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </section>
  );
}
