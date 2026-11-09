"use client";

import { useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/helpers";
import type {
  CheckboxProps,
  FieldShellProps,
  InputProps,
  SelectProps,
  TextareaProps,
} from "./Field.props";
import styles from "./field.module.scss";

interface ShellRenderProps extends FieldShellProps {
  id: string;
  children: ReactNode;
}

function useFieldIds(id: string | undefined, hint: ReactNode, error?: string) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return { controlId, hintId, errorId, describedBy };
}

/** Label, control slot, hint and error laid out like a storefront form field. */
export function FieldShell({
  id,
  label,
  hint,
  error,
  className,
  children,
}: ShellRenderProps) {
  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      ) : null}
      {children}
      {hint ? (
        <span id={`${id}-hint`} className={styles.hint}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const ids = useFieldIds(id, hint, error);

  return (
    <FieldShell
      id={ids.controlId}
      label={label}
      hint={hint}
      error={error}
      className={className}
    >
      <input
        {...props}
        id={ids.controlId}
        className={styles.control}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={ids.describedBy ?? props["aria-describedby"]}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  error,
  className,
  id,
  children,
  ...props
}: SelectProps) {
  const ids = useFieldIds(id, hint, error);

  return (
    <FieldShell
      id={ids.controlId}
      label={label}
      hint={hint}
      error={error}
      className={className}
    >
      <span className={styles.selectWrap}>
        <select
          {...props}
          id={ids.controlId}
          className={cn(styles.control, styles.select)}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={ids.describedBy ?? props["aria-describedby"]}
        >
          {children}
        </select>
        <ChevronDown size={16} aria-hidden="true" className={styles.chevron} />
      </span>
    </FieldShell>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const ids = useFieldIds(id, hint, error);

  return (
    <FieldShell
      id={ids.controlId}
      label={label}
      hint={hint}
      error={error}
      className={className}
    >
      <textarea
        {...props}
        id={ids.controlId}
        rows={rows}
        className={cn(styles.control, styles.textarea)}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={ids.describedBy ?? props["aria-describedby"]}
      />
    </FieldShell>
  );
}

export function Checkbox({
  label,
  adornment,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label className={cn(styles.check, className)}>
      <input {...props} type="checkbox" className={styles.checkInput} />
      {adornment}
      <span className={styles.checkLabel}>{label}</span>
    </label>
  );
}
