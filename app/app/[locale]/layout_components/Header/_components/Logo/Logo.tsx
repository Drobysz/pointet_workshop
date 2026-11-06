import { after } from "@/fonts/fonts"
import { cn } from "@/helpers"
import { Link } from "@/i18n/navigation";
import s from "../../style.module.scss";
import { useTranslations } from "next-intl";

export const Logo = ()=> {
    const t = useTranslations("navigation.header");

    return (
        <Link
            className={s.logo_link}
            href="/home"
            aria-label={t("logoLabel")}
        >
            <span 
                className={cn(
                    after.className,
                    s.logo_title
                )}
            >
                Pointet
            </span>
        </Link>
    )
}
