import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export interface FieldShellProps {
  /** Visible field name. Rendered as a `<label>` tied to the control. */
  label?: ReactNode;
  /** Secondary guidance under the control. */
  hint?: ReactNode;
  /** Validation message; also sets `aria-invalid` on the control. */
  error?: string;
  className?: string;
}

export type InputProps = FieldShellProps & InputHTMLAttributes<HTMLInputElement>;
export type SelectProps = FieldShellProps & SelectHTMLAttributes<HTMLSelectElement>;
export type TextareaProps = FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  /** Optional swatch or icon shown before the label. */
  adornment?: ReactNode;
  className?: string;
}
