"use client"

import { createContext, ReactNode, useEffect, useState } from "react";
import { AppNotification, AuthStatus, Coords, GlobalContextInterface, PopUpWindow } from "./global.interface";
import { useCurrentUser, useWindowWidth } from "@/hooks";
import { LoginForm, RegisterForm } from "@/types/auth";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/api/api";
import { useRouter } from "@/i18n/navigation";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { refreshErrorMessages } from "@/api/core/errorMessages";
import { useUserData } from "@/hooks/useUserData";

const noneNotification: AppNotification = { 
    status: "none", 
    text: "" 
};

const emptyLogForm: LoginForm = {
    email: "",
    password: ""
};

const emptyRegForm: RegisterForm = {
    email: "",
    full_name: "",
    password: ""
};

export const GlobalContext = createContext<GlobalContextInterface>({
    logFormData: emptyLogForm,
    regFormData: emptyRegForm,

    authStatus: "unauthenficated",
    isUserLoading: false,

    isBasketLoading: false,
    isOrdersLoading: false,

    notification: noneNotification,
    popUpWindow: "none",
	blur: false,
	mouseText: "",
	mouseGuide: null,
	isMouseVisible: false,

    setLogFormData: () => {},
    setRegFormData: () => {},

    setAuthStatus: () => {},
    mutateUser: async () => undefined,
    mutateBasket: async () => undefined,
    mutateOrders: async () => undefined,

    setPopUpWindow: () => {},
	setMouseText: ()=> {},
	setMouseGuide: ()=> {},
	setNotification: () => {},
});

export const GlobalContextProvider = ({
    children
}: {
    children: ReactNode;
})=> {
    const router = useRouter();

    const {
		data: user,
		error: userError,
		isLoading: isUserLoading,
		mutate: mutateUser
	} = useCurrentUser();

    const {
		data: basketList,
		error: basketError,
		isLoading: isBasketLoading,
		mutate: mutateBasket
	} = useUserData("basket");

    const {
		data: ordersList,
		error: ordersError,
		isLoading: isOrdersLoading,
		mutate: mutateOrders
	} = useUserData("orders");

    const [notification, setNotification] 
        = useState<AppNotification>(noneNotification);
    const [popUpWindow, setPopUpWindow] = useState<PopUpWindow>("none");
    const [mouseText, setMouseText] = useState("");
	const [mouseGuide, setMouseGuide] = useState<Coords | null>(null);

    const [logFormData, setLogFormData] = useState<LoginForm>(emptyLogForm);
    const [regFormData, setRegFormData] = useState<RegisterForm>(emptyRegForm);
    const [authStatus, setAuthStatus] = useState<AuthStatus>("unauthenficated");

    const isMouseVisible = useWindowWidth(768) as boolean;
	const blur = popUpWindow !== "none";

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

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
    }, [token, router]);

    useEffect(()=> {
        const updateStatus = ()=> {
            setAuthStatus("authenficated");
        }

        if (user && !userError) {
            updateStatus();
        }
    }, [user, userError])

    return (
        <GlobalContext.Provider
            value={{
                notification: notification,
                popUpWindow: popUpWindow,
                blur: blur,
                mouseText: mouseText,
                mouseGuide: mouseGuide,
                isMouseVisible: isMouseVisible,

                logFormData: logFormData,
                regFormData: regFormData,
                authStatus: authStatus,

                user: user,
                isUserLoading: isUserLoading,
                userError: userError,

                basketList: basketList,
                isBasketLoading: isBasketLoading,
                basketError: basketError,

                ordersList: ordersList,
                isOrdersLoading: isOrdersLoading,
                ordersError: ordersError,

                setNotification,
                setPopUpWindow,
                setMouseText,
                setMouseGuide,
                setLogFormData,
                setRegFormData,
                setAuthStatus,

                mutateUser,
                mutateBasket,
                mutateOrders
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
};
