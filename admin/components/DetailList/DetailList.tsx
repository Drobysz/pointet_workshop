import type { ReactNode } from "react";
import { cn } from "@/helpers";
import styles from "./detail-list.module.scss";

export interface DetailItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
}

interface DetailListProps {
  items: DetailItem[];
  /**
   * `inline` draws the storefront's dotted leader between label and value;
   * `stacked` puts long values on their own line.
   */
  layout?: "inline" | "stacked";
  className?: string;
}

export function DetailList({
  items,
  layout = "inline",
  className,
}: DetailListProps) {
  return (
    <dl className={cn(styles.list, styles[layout], className)}>
      {items.map((item) => (
        <div key={item.key} className={styles.row}>
          <dt className={styles.key}>{item.label}</dt>
          {layout === "inline" ? <span className={styles.leader} aria-hidden="true" /> : null}
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
