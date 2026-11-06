import { authApi } from "@/api/api";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { refreshErrorMessages } from "@/api/core/errorMessages";
import { AppNotification, AuthStatus } from "@/app/[locale]/context/global.interface";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useEffect } from "react";

export const useVerifyToken = (
    token: string | null,
    setNotification: Dispatch<SetStateAction<AppNotification>>,
    setAuthStatus: Dispatch<SetStateAction<AuthStatus>>,
)=> {
    const router = useRouter();
    const t = useTranslations();

    return (
       useEffect(()=> {
            const verifyUserAuthStatus = async ()=> {
                if (!token) return;

                try {
                    const { data } = (await authApi.verify({
                        token: token as string
                    }));
    
                    if (!data.authenticated) {
                        setNotification({
                            status: "alert",
                            text: t("notifications.emailVerification.tokenRejected")
                        });
                    };
    
                    setAuthStatus("authenficated");
                    setNotification({
                        status: "success",
                        text: t("notifications.emailVerification.success")
                    });
                    router.replace("/home");
                } catch (error) {
                    const message = getApiErrorMessage(
                        error,
                        t,
                        refreshErrorMessages,
                    );
                    
                    setNotification({
                        status: "error",
                        text: message
                    });
                }
            }
    
            verifyUserAuthStatus();
        }, [token, router, t, setAuthStatus, setNotification])
    )
}
