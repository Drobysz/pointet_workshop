import { DecoInput } from "@/components";
import { inter_regular, jersey10 } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { ChangeEvent, DetailedHTMLProps, Dispatch, HTMLAttributes, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { BasketRequestData } from "../../formScheme/BasketFormScheme";

interface BasketInputProps
extends DetailedHTMLProps<HTMLAttributes<HTMLInputElement>, HTMLInputElement>
{
    key?: string;
    label: string;
    name: string;
    error?: string;
    setBasketRequestData: Dispatch<SetStateAction<BasketRequestData>>;
}

export const BasketInput = ({
    label,
    name,
    error,
    setBasketRequestData,
    ...props
}: BasketInputProps)=> {
    const t = useTranslations("checkout.email");

    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setBasketRequestData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <label className="flex flex-col gap-1 max-md:flex-wrap">
            <span className={cn(
                jersey10.className,
                "text-2xl pl-2 flex items-center gap-1"
            )}>
                
                <span>
                    {label}
                </span>
            </span>

            <DecoInput
                {...props}
                className=""
                type="email"
                name={name}
                onChange={handleChange}
            />

            {error && 
                <span className={cn(
                    inter_regular.className,
                    "text-red-600"
                )}>
                    {error}
                </span>
            }
        </label>
    )
}
