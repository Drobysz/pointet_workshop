import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/helpers";
import styles from "./back-link.module.scss";

interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/** The storefront "go back" pill. */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link href={href} className={cn(styles.link, className)}>
      <ArrowLeft size={16} aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}
