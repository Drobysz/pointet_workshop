import type { CSSProperties } from "react";
import { cn } from "@/helpers";
import styles from "./spinner.module.scss";

interface SpinnerProps {
  /** Diameter in pixels. */
  size?: number;
  className?: string;
}

/** Decorative progress ring; the surrounding element carries the status text. */
export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <span
      className={cn(styles.spinner, className)}
      style={{ "--spinner-size": `${size}px` } as CSSProperties}
      aria-hidden="true"
    />
  );
}
