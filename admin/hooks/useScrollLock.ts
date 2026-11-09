"use client";

import { useEffect } from "react";

let lockCount = 0;
let previousOverflow = "";

/**
 * Prevents the page behind an open overlay from scrolling. Several
 * overlays may lock at once (a modal above the mobile navigation); the
 * document scrolls again once the last one releases.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const root = document.documentElement;

    if (lockCount === 0) {
      previousOverflow = root.style.overflow;
      root.style.overflow = "hidden";
    }

    lockCount += 1;

    return () => {
      lockCount -= 1;

      if (lockCount === 0) {
        root.style.overflow = previousOverflow;
      }
    };
  }, [isLocked]);
}
