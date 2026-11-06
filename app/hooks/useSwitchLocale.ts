import { userApi } from "@/api/api";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { CookiesService } from "@/helpers";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useContext, useTransition } from "react";

const LOCALE_COOKIE_DAYS = 365;

/**
 * Switches the interface language while staying on the current page:
 * the pathname, query string and hash are carried over to the new locale.
 */
export const useSwitchLocale = ()=> {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();
    const { user, mutateUser } = useContext(GlobalContext);

    const switchLocale = (newLocale: AppLocale)=> {
        if (locale === newLocale) return;

        startTransition(async ()=> {
            const cookies = new CookiesService();

            if (user) {
                try {
                    await userApi.updateUser(
                        user.id,
                        { language: newLocale }
                    )
                    mutateUser();
                } catch {
                    // Saving the preference to the account is best-effort:
                    // the language must still switch for this browser.
                }
            }

            cookies.setCookies(
                "NEXT_LOCALE",
                newLocale,
                LOCALE_COOKIE_DAYS,
            );

            // Read at click time, so no Suspense boundary is required.
            const { search, hash } = window.location;

            router.replace(
                `${pathname}${search}${hash}`,
                { locale: newLocale }
            );
        })
    };

    return {
        locale,
        isPending,
        switchLocale,
    }
}
