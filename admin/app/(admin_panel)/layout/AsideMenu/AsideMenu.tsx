"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  ChartNoAxesCombined,
  Languages,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  localeCookieName,
  supportedLocales,
  type AppLocale,
} from "@/i18n/config";
import { logout } from "@/queries";
import styles from "./aside-menu.module.scss";

const navigation = [
  ["dashboard", "/dashboard", ChartNoAxesCombined],
  ["users", "/users", Users],
  ["orders", "/orders", ShoppingBag],
  ["goods", "/goods", Package],
  ["admins", "/admins", ShieldCheck],
  ["markers", "/markers", Tags],
] as const;

export function AsideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("navigation");
  const languageNames = useTranslations("languages");
  const common = useTranslations("common");
  const [open, setOpen] = useState(false);

  async function signOut() {
    await logout().catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  function changeLocale(nextLocale: AppLocale) {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = [
      `${localeCookieName}=${nextLocale}`,
      "path=/",
      `max-age=${oneYear}`,
      "samesite=lax",
    ].join("; ");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className={styles.mobileToggle}
        aria-label={t("open")}
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      <aside className={`${styles.aside} ${open ? styles.open : ""}`}>
        <div className={styles.brand}>
          <span><Boxes size={19} /></span>
          <strong>Workshop</strong>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("close")}
          >
            <X size={19} />
          </button>
        </div>

        <nav aria-label={t("administration")}>
          {navigation.map(([labelKey, href, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{t(labelKey)}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <label className={styles.language}>
            <Languages size={18} />
            <span className="sr-only">{common("language")}</span>
            <select
              value={locale}
              onChange={(event) => {
                changeLocale(event.target.value as AppLocale);
              }}
              aria-label={common("language")}
            >
              {supportedLocales.map((supportedLocale) => (
                <option key={supportedLocale} value={supportedLocale}>
                  {languageNames(supportedLocale)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.logout} onClick={signOut}>
            <LogOut size={18} />
            <span>{t("signOut")}</span>
          </button>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className={styles.scrim}
          aria-label={t("close")}
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
