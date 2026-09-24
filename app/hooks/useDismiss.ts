import { RefObject, useEffect } from "react";

interface UseDismissProps {
    isOpen: boolean;
    onDismiss: ()=> void;
    refs: RefObject<HTMLElement | null>[];
};

export const useDismiss = ({
    isOpen,
    refs,
    onDismiss,
}: UseDismissProps)=> {
    return (
        useEffect(()=>{
            if (!isOpen) return;

            const handleMouseClick = (e: MouseEvent)=> {
                const target = e.target as Node;

                const isInside = refs.some(
                    ref => ref.current?.contains(target)
                );

                if (!isInside) {
                    onDismiss();
                }
            };

            const handleKeyDown = (e: KeyboardEvent)=> {
                if (e.key === 'Escape') {
                    onDismiss();
                }
            };

            document.addEventListener('mousedown', handleMouseClick);
            document.addEventListener('keydown', handleKeyDown);

            return ()=> {
                document.removeEventListener('mousedown', handleMouseClick);
                document.removeEventListener('keydown', handleKeyDown);
            }

        }, [isOpen, refs, onDismiss])
    )
}
