import Link from "next/link";
import { cn } from "@/helpers";
import { Spinner } from "../Spinner/Spinner";
import type {
  ButtonLinkProps,
  ButtonProps,
  ButtonStyleProps,
} from "./Button.props";
import styles from "./button.module.scss";

/** Class list of a button-looking control; shared by `Button` and `ButtonLink`. */
export function buttonClassName({
  variant = "secondary",
  size = "md",
  icon = false,
  full = false,
  className,
}: ButtonStyleProps): string {
  return cn(
    styles.button,
    styles[variant],
    styles[size],
    icon && styles.icon,
    full && styles.full,
    className,
  );
}

export function Button({
  variant,
  size,
  icon,
  full,
  className,
  pending = false,
  disabled,
  type = "button",
  ref,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(
        buttonClassName({ variant, size, icon, full, className }),
        pending && styles.pending,
      )}
    >
      {pending ? <Spinner size={icon ? 18 : 16} /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  full,
  className,
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      className={buttonClassName({ variant, size, icon, full, className })}
    >
      {children}
    </Link>
  );
}
