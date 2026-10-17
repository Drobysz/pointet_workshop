"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ModalProps } from "./Modal.props";
import styles from "./modal.module.scss";

export function Modal({ title, children, onClose }: ModalProps) {
  const t = useTranslations("common");
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const adminScrollRoot = document.querySelector<HTMLElement>(
      "[data-admin-scroll-root]",
    );
    const scrollRoot = adminScrollRoot ?? document.body;
    const previousOverflow = scrollRoot.style.overflow;

    scrollRoot.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      scrollRoot.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleBackdropMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header>
          <h2 id={titleId}>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("closeDialog")}
          >
            <X size={18} />
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  );
}
