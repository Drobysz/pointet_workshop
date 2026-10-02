export type inputType = "email" 
    | "password" 
    | "text";

export interface InputProps 
extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    value?: string;
    type?: inputType;
    label: string;
    name: string;
    error?: string;
    className?: string;
}
