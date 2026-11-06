"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query, so JS-driven behaviour switches at exactly
 * the same breakpoints as the stylesheets. Resolves to `false` on the server.
 */
export const useMediaQuery = (query: string): boolean => {
    const subscribe = useCallback((onChange: ()=> void)=> {
        const media = window.matchMedia(query);

        media.addEventListener("change", onChange);

        return ()=> media.removeEventListener("change", onChange);
    }, [query]);

    return useSyncExternalStore(
        subscribe,
        ()=> window.matchMedia(query).matches,
        ()=> false,
    );
};
