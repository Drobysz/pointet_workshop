import { userApi } from "@/api/api";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { CookiesClient } from "@/helpers";
import { usePathname, useRouter } from "@/i18n/navigation";
import { language } from "@/types/auth";
import { useLocale } from "next-intl";
import { useContext, useTransition } from "react";

export const useSwitchLocale = (newLocale: language)=> {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();
    const { user, mutateUser } = useContext(GlobalContext);

    const switchLocale = async ()=> {
        if (locale === newLocale) return;

        if (newLocale) {
            startTransition(async ()=> {
                const cookies = new CookiesClient();

                if (user) {
                    await userApi.updateUser(
                        user.id,
                        { language: newLocale }
                    )
                    mutateUser();
                }
            
                cookies.setCookies(
                    "NEXT_LOCALE",
                    newLocale,
                    60 * 60 * 24 * 365,
                );

                router.replace(
                    pathname,
                    { locale: newLocale }
                );
            })
        }
    };

    return {
        isPending,
        switchLocale,
    }
}