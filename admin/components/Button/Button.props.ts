import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import type { LinkProps } from "next/link";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Square control holding only an icon. Pass `aria-label` with it. */
  icon?: boolean;
  /** Stretches the control to the width of its container. */
  full?: boolean;
  className?: string;
}

export interface ButtonProps
  extends ButtonStyleProps,
    ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a progress ring and blocks interaction while a request runs. */
  pending?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children?: ReactNode;
}

export interface ButtonLinkProps
  extends ButtonStyleProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: LinkProps["href"];
  children?: ReactNode;
}
