"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginSchema } from "@/auth/FormSchemes";
import { Button, Input } from "@/components";
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
    <section className={styles.window} aria-labelledby="login-title">
      <form action={handleSubmit} className={styles.form}>
        <div className={styles.heading}>
          <h1 id="login-title" className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <div className={styles.fields}>
          <Input
            label={t("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Input
            label={t("password")}
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </div>

        {error ? <p className={styles.error} role="alert">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" full pending={isSubmitting}>
          {isSubmitting ? t("signingIn") : t("signIn")}
        </Button>
      </form>
    </section>
  );
}
