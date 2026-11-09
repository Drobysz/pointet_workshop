"use client";

import type { ReactNode } from "react";
import { cn } from "@/helpers";
import styles from "./segmented.module.scss";

export interface SegmentedItem<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string> {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group. */
  label: string;
  /**
   * `tabs` switches between views (role `tablist`); `group` picks a
   * parameter such as a date range (toggle buttons with `aria-pressed`).
   */
  mode?: "tabs" | "group";
  size?: "sm" | "md";
  className?: string;
}

/** Row of storefront-style category chips; the selected one fills red. */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  mode = "tabs",
  size = "md",
  className,
}: SegmentedProps<T>) {
  const isTabs = mode === "tabs";

  return (
    <div
      className={cn(styles.row, styles[size], className)}
      role={isTabs ? "tablist" : "group"}
      aria-label={label}
    >
      {items.map((item) => {
        const isSelected = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role={isTabs ? "tab" : undefined}
            aria-selected={isTabs ? isSelected : undefined}
            aria-pressed={isTabs ? undefined : isSelected}
            className={cn(styles.chip, isSelected && styles.selected)}
            onClick={() => onChange(item.value)}
          >
            <span className={styles.chipLabel}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
