"use client";

import { BtnPending, MainBtn } from "@/components";
import { tinyFive } from "@/fonts/fonts";
import { cn } from "@/helpers";
import s from "./style.module.scss";

export const InputBtn = ({
    buttonDisabled,
    pending,
}: {
    buttonDisabled: boolean;
    pending: boolean;
})=> {
    return (
        <MainBtn
            disabled={buttonDisabled}
            className={cn(
                tinyFive.className,
                s.change_btn,
                buttonDisabled
                    && "opacity-50 cursor-not-allowed"
            )}
        >
            <BtnPending
                pending={pending}
            >
                Change
            </BtnPending>
        </MainBtn>
    )
}
