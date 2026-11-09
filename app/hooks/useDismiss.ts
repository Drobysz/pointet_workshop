import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

interface UseDismissProps {
    isOpen: boolean;
    onDismiss: ()=> void;
    refs: RefObject<HTMLElement | null>[];
};

/**
 * Calls `onDismiss` on a click outside of `refs` or on Escape while
 * `isOpen`. The document listeners are attached once per open state:
 * the latest `refs` and `onDismiss` are read through a ref, so callers
 * may pass inline arrays and callbacks without re-subscribing on every
 * render.
 */
export const useDismiss = ({
    isOpen,
    refs,
    onDismiss,
}: UseDismissProps)=> {
    const latest = useRef({ refs, onDismiss });

    useLayoutEffect(()=> {
        latest.current = { refs, onDismiss };
    });

    useEffect(()=>{
        if (!isOpen) return;

        const handleMouseClick = (e: MouseEvent)=> {
            const target = e.target as Node;

            const isInside = latest.current.refs.some(
                ref => ref.current?.contains(target)
            );

            if (!isInside) {
                latest.current.onDismiss();
            }
        };

        const handleKeyDown = (e: KeyboardEvent)=> {
            if (e.key === 'Escape') {
                latest.current.onDismiss();
            }
        };

        document.addEventListener('mousedown', handleMouseClick);
        document.addEventListener('keydown', handleKeyDown);

        return ()=> {
            document.removeEventListener('mousedown', handleMouseClick);
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen]);
}
