"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import { useMediaQuery, useScrollLock } from "@/hooks";
import { Brand } from "../Brand/Brand";
import { LocaleSwitcher } from "../LocaleSwitcher/LocaleSwitcher";
import { NavList } from "../NavList/NavList";
import { SignOutButton } from "../SignOutButton/SignOutButton";
import styles from "./mobile-nav.module.scss";

// The drawer replaces the sidebar below the tablet breakpoint.
const MOBILE_QUERY = "(max-width: 47.99rem)";

/**
 * Sticky top bar with a burger that unfolds a sheet from behind it, as the
 * storefront's mobile menu. The sheet is always in the DOM (CSS handles the
 * enter/exit transition) and is made `inert` while closed. Storing the
 * pathname at open time means a route change closes it without an effect.
 */
export function MobileNav() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const sheetId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [openedAt, setOpenedAt] = useState<string | null>(null);

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const isOpen = isMobile && openedAt === pathname;

  useScrollLock(isOpen);

  const close = () => setOpenedAt(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    const trigger = triggerRef.current;

    sheetRef.current?.focus();
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <header className={styles.bar}>
        <Brand />
        <button
          ref={triggerRef}
          type="button"
          className={cn(styles.burger, isOpen && styles.burgerOpen)}
          aria-label={isOpen ? t("close") : t("open")}
          aria-expanded={isOpen}
          aria-controls={sheetId}
          onClick={() => (isOpen ? close() : setOpenedAt(pathname))}
        >
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
        </button>
      </header>

      <div
        className={cn(styles.overlay, isOpen && styles.overlayOpen)}
        aria-hidden="true"
        onClick={close}
      />

      <div
        ref={sheetRef}
        id={sheetId}
        className={cn(styles.sheet, isOpen && styles.sheetOpen)}
        role="dialog"
        aria-modal="true"
        aria-label={t("administration")}
        tabIndex={-1}
        inert={!isOpen}
      >
        <NavList variant="sheet" onNavigate={close} />
        <section className={styles.account} aria-label={t("account")}>
          <LocaleSwitcher />
          <SignOutButton />
        </section>
      </div>
    </>
  );
}
