import type { ReactNode } from "react";

export interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  /** `lg` suits long forms such as the product editor. */
  size?: "md" | "lg";
}
