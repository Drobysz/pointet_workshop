import { getTranslations } from "next-intl/server";
import { LoginForm } from "./_components/LoginForm/LoginForm";
import styles from "./login.module.scss";

export default async function LoginPage() {
  const t = await getTranslations("login");

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-hidden="true">
        <span className={styles.signs}>
          <span>{t("welcome")}</span>
          <span>{t("brandTagline")}</span>
        </span>
        <span className={styles.wordmark}>Pointet</span>
      </section>
      <div className={styles.formColumn}>
        <LoginForm />
      </div>
    </main>
  );
}
