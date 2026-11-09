"use client";

import { useId, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/helpers";
import styles from "./search-field.module.scss";

interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name; visually hidden. */
  label: string;
  className?: string;
}

/** The storefront search bar: gray pill, magnifier that turns red on focus. */
export function SearchField({
  value,
  onChange,
  label,
  className,
  id,
  ...props
}: SearchFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn(styles.wrapper, className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search size={18} aria-hidden="true" className={styles.icon} />
      <input
        {...props}
        id={inputId}
        type="search"
        value={value}
        className={styles.input}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
