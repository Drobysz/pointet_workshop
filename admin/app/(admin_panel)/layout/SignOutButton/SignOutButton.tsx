"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Spinner } from "@/components";
import { cn } from "@/helpers";
import { logout } from "@/queries";
import styles from "./sign-out-button.module.scss";

interface SignOutButtonProps {
  variant?: "full" | "compact";
  className?: string;
}

/** Ends the admin session and returns to the login screen. */
export function SignOutButton({ variant = "full", className }: SignOutButtonProps) {
  const router = useRouter();
  const t = useTranslations("navigation");
  const [isPending, setIsPending] = useState(false);

  async function signOut() {
    setIsPending(true);

    try {
      await logout().catch(() => undefined);
      router.replace("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      className={cn(styles.button, variant === "compact" && styles.compact, className)}
      disabled={isPending}
      title={t("signOut")}
      aria-label={variant === "compact" ? t("signOut") : undefined}
      onClick={() => void signOut()}
    >
      {isPending ? (
        <Spinner size={16} />
      ) : (
        <LogOut size={18} aria-hidden="true" className={styles.icon} />
      )}
      <span className={styles.label}>{t("signOut")}</span>
    </button>
  );
}
