export interface InputLiteProps
extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    value?: string;
    label: string;
    name: string;
    error?: string;
    options?: string[];
    className?: string;
    colSpan?: number;
}