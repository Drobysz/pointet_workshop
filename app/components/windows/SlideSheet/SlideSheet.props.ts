import { ReactNode, RefObject } from "react";

export interface SlideSheetProps {
    isOpen: boolean;
    onClose: ()=> void;
    /** Accessible name of the dialog. */
    label: string;
    /** Edge of the screen the sheet slides in from. */
    side?: "top" | "bottom";
    id?: string;
    className?: string;
    /**
     * Element that toggles the sheet. Clicks on it are not treated as
     * outside clicks, and it receives focus back when the sheet closes.
     */
    triggerRef?: RefObject<HTMLElement | null>;
    children: ReactNode;
}
