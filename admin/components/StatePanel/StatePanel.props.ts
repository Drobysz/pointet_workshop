export interface StatePanelProps {
  state: "loading" | "error" | "empty";
  onRetry?: () => void;
  /** Shorter panel for states nested inside a card. */
  compact?: boolean;
}
