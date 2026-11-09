"use client";

import { useTranslations } from "next-intl";
import { Brand } from "../Brand/Brand";
import { LocaleSwitcher } from "../LocaleSwitcher/LocaleSwitcher";
import { NavList } from "../NavList/NavList";
import { SignOutButton } from "../SignOutButton/SignOutButton";
import styles from "./sidebar.module.scss";

/**
 * Persistent navigation card: full width on desktop, an icon rail on
 * tablets, hidden on phones where `MobileNav` takes over. Breakpoints
 * live in CSS; the markup is the same at every size.
 */
export function Sidebar() {
  const t = useTranslations("navigation");

  return (
    <aside className={styles.aside} aria-label={t("administration")}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Brand className={styles.brandFull} />
          <Brand variant="mark" className={styles.brandMark} />
        </div>

        <NavList variant="sidebar" />

        <div className={styles.footer}>
          <LocaleSwitcher className={styles.localeFull} />
          <LocaleSwitcher variant="compact" className={styles.localeCompact} />
          <SignOutButton className={styles.signOutFull} />
          <SignOutButton variant="compact" className={styles.signOutCompact} />
        </div>
      </div>
    </aside>
  );
}
