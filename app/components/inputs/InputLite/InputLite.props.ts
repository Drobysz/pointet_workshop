import type { InputHTMLAttributes } from "react";

export interface InputLiteProps
extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    name: string;
    error?: string;
    options?: string[];
    className?: string;
    colSpan?: number;
    rows?: number;
}
