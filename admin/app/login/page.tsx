import { getTranslations } from "next-intl/server";
import { LoginForm } from "./_components/LoginForm/LoginForm";
import styles from "./login.module.scss";

export default async function LoginPage() {
  const t = await getTranslations("login");

  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div className={styles.mark}>W</div>
        <h1>{t("heading")}</h1>
        <p>{t("description")}</p>
      </section>
      <LoginForm />
    </main>
  );
}
