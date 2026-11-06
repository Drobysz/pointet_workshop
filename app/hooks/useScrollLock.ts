import { useEffect } from "react";

/** Prevents the page behind an open overlay from scrolling. */
export const useScrollLock = (isLocked: boolean)=> {
    useEffect(()=> {
        if (!isLocked) return;

        const root = document.documentElement;
        const previousOverflow = root.style.overflow;

        root.style.overflow = "hidden";

        return ()=> {
            root.style.overflow = previousOverflow;
        };
    }, [isLocked]);
};
