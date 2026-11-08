import { jersey10 } from "@/fonts/fonts";
import s from "./style.module.scss";
import { useTranslations } from "next-intl";

export const ErrorTitle = ({
    basketError,
    basketLength,
}: {
    basketError: Error | undefined;
    basketLength: number;
})=> {
    const t = useTranslations();

    return (
        <div className={s.error_title_filler}>
            <h2 className={jersey10.className}> 
                {basketError && t("common.states.loadFailed")}
                {basketLength < 1 && t("basket.states.empty")}
            </h2>
        </div>
    )
}