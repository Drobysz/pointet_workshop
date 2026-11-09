import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import styles from "./brand.module.scss";

interface BrandProps {
  /** `mark` shows only the initial, for the collapsed rail. */
  variant?: "full" | "mark";
  className?: string;
}

/** The storefront wordmark with an "Admin" tag. */
export function Brand({ variant = "full", className }: BrandProps) {
  const t = useTranslations("navigation");

  return (
    <Link
      href="/dashboard"
      className={cn(styles.brand, variant === "mark" && styles.markOnly, className)}
      aria-label={`Pointet ${t("brandSuffix")}`}
    >
      <span className={styles.wordmark} aria-hidden="true">
        {variant === "mark" ? "P" : "Pointet"}
      </span>
      <span className={styles.tag} aria-hidden="true">
        {t("brandSuffix")}
      </span>
    </Link>
  );
}
