import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/helpers";
import styles from "./panel.module.scss";

type PanelTag = "section" | "article" | "aside" | "div";

interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: PanelTag;
  /** Removes the inner padding, e.g. for tables that manage their own. */
  flush?: boolean;
  /** Recessed gray variant for blocks nested inside a white panel. */
  inset?: boolean;
  children: ReactNode;
}

interface PanelHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Heading level of the title; panels nested in a page use `2`. */
  level?: 2 | 3;
  id?: string;
}

/** White surface floating on the canvas, as the storefront's cards. */
export function Panel({
  as: Tag = "section",
  flush = false,
  inset = false,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <Tag
      {...props}
      className={cn(
        styles.panel,
        inset && styles.inset,
        !flush && styles.padded,
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelHeader({
  title,
  description,
  actions,
  level = 2,
  id,
}: PanelHeaderProps) {
  const Heading = level === 2 ? "h2" : "h3";

  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <Heading id={id} className={styles.title}>
          {title}
        </Heading>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
