import { authApi } from "@/api/api";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { refreshErrorMessages } from "@/api/core/errorMessages";
import { AppNotification, AuthStatus } from "@/app/[locale]/context/global.interface";
import { useRouter } from "@/i18n/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";

export const useVerifyToken = (
    token: string | null,
    setNotification: Dispatch<SetStateAction<AppNotification>>,
    setAuthStatus: Dispatch<SetStateAction<AuthStatus>>,
)=> {
    const router = useRouter();

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
                            text: "Token didn't work."
                        });
                    };
    
                    setAuthStatus("authenficated");
                    setNotification({
                        status: "success",
                        text: "Succesfully registered"
                    });
                    router.replace("/home");
                } catch (error) {
                    const message = getApiErrorMessage(
                        error,
                        refreshErrorMessages,
                    );
                    
                    setNotification({
                        status: "error",
                        text: message
                    });
                }
            }
    
            verifyUserAuthStatus();
        }, [token, router, setAuthStatus, setNotification])
    )
}
