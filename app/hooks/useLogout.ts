"use client";

import { authApi } from "@/api/api";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { logoutErrorMessages } from "@/api/core/errorMessages";
import { GlobalContext } from "@/app/[locale]/context/global.context";
import { useRouter } from "@/i18n/navigation";
import { Dispatch, SetStateAction, useContext, useState } from "react";

export const useLogout = (
    setOpen?: Dispatch<SetStateAction<boolean>>
)=> {
    const [pending, setPending] = useState(false);
    const router = useRouter();

    const { 
        setAuthStatus, 
        setNotification, 
        mutateUser, 
    } = useContext(GlobalContext);

    return ({
        logOut: async () => {
            setPending(true);
            
            try {
                await authApi.logout();
    
                setAuthStatus("unauthenficated");
                mutateUser();
                setNotification({ 
                    status: "success", 
                    text: "Succefully logged out" 
                });
    
                setPending(false);

                if (setOpen) {
                    setOpen(false)
                };
    
                router.push("/home");
            } catch (error) {
                const message = getApiErrorMessage(
                    error,
                    logoutErrorMessages
                ); 
    
                setNotification({ 
                    status: "error", 
                    text: message,
                });

                setPending(false);
            }
        },
        isPending: pending
    })
}
