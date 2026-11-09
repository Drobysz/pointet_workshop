"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import { useScrollLock } from "@/hooks";
import { Button } from "../Button/Button";
import type { ModalProps } from "./Modal.props";
import styles from "./modal.module.scss";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Centered dialog styled like the storefront's shadowed windows. Locks the
 * page scroll, traps keyboard focus, closes on Escape or a backdrop click,
 * and hands focus back to the opener once closed.
 */
export function Modal({ title, children, onClose, size = "md" }: ModalProps) {
  const t = useTranslations("common");
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useScrollLock(true);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    closeRef.current?.focus();

    return () => {
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Keep Tab cycling inside the dialog while it is open.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        ref={dialogRef}
        className={cn(styles.modal, styles[size])}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <header className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <Button
            ref={closeRef}
            variant="ghost"
            icon
            size="sm"
            aria-label={t("closeDialog")}
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </header>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  );
}
