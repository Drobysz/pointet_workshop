"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import { isActivePath, navigation } from "../navigation";
import styles from "./nav-list.module.scss";

interface NavListProps {
  /** `rail` keeps icons only (tablet); `sheet` is the mobile drawer list. */
  variant: "sidebar" | "sheet";
  onNavigate?: () => void;
}

/** Section links shared by the sidebar and the mobile drawer. */
export function NavList({ variant, onNavigate }: NavListProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");

  return (
    <nav aria-label={t("sections")} className={styles[variant]}>
      <ul className={styles.list}>
        {navigation.map(({ key, href, icon: Icon }) => {
          const isActive = isActivePath(pathname, href);
          const label = t(key);

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(styles.link, isActive && styles.active)}
                aria-current={isActive ? "page" : undefined}
                title={variant === "sidebar" ? label : undefined}
                onClick={onNavigate}
              >
                <Icon size={19} aria-hidden="true" className={styles.icon} />
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
