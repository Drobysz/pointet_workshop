import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Renders a "back" pill above the title. */
  back?: { href: string; label: string };
}
