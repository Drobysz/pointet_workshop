"use client"

import { createContext, Dispatch, ReactNode, SetStateAction, Suspense, useEffect, useRef, useState } from "react";
import { AppNotification, AuthStatus, Coords, GlobalContextInterface, PopUpWindow } from "./global.interface";
import { useCurrentUser, useVerifyToken, useWindowWidth } from "@/hooks";
import { LoginForm, RegisterForm } from "@/types/auth";
import { useSearchParams } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { basketApi, guestBasketApi } from "@/api/api";
import { LocalBasketService } from "@/helpers/basket";

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
    isPreOrdersLoading: false,

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
    mutatePreOrders: async () => undefined,

    setPopUpWindow: () => {},
	setMouseText: ()=> {},
	setMouseGuide: ()=> {},
	setNotification: () => {},
});

/**
 * Completes e-mail verification links (`?token=`).
 * `useSearchParams` opts its nearest Suspense boundary out of static
 * rendering, so it is isolated here instead of living in the provider,
 * which would turn every page into a client-rendered shell.
 */
const TokenVerifier = ({
    setNotification,
    setAuthStatus,
}: {
    setNotification: Dispatch<SetStateAction<AppNotification>>;
    setAuthStatus: Dispatch<SetStateAction<AuthStatus>>;
})=> {
    const searchParams = useSearchParams();

    useVerifyToken(
        searchParams.get("token"),
        setNotification,
        setAuthStatus,
    );

    return null;
};

export const GlobalContextProvider = ({
    children
}: {
    children: ReactNode;
})=> {
    const [notification, setNotification] 
        = useState<AppNotification>(noneNotification);
    const [popUpWindow, setPopUpWindow] = useState<PopUpWindow>("none");
    const [mouseText, setMouseText] = useState("");
	const [mouseGuide, setMouseGuide] = useState<Coords | null>(null);

    const [logFormData, setLogFormData] = useState<LoginForm>(emptyLogForm);
    const [regFormData, setRegFormData] = useState<RegisterForm>(emptyRegForm);
    const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
    const mergedGuestBasketForUser = useRef<number | null>(null);

    const isMouseVisible = useWindowWidth(768) as boolean;
	const blur = popUpWindow !== "none";

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
	} = useUserData(
        "basket",
        authStatus
    );

    const {
		data: ordersList,
		error: ordersError,
		isLoading: isOrdersLoading,
		mutate: mutateOrders
	} = useUserData(
        "orders",
        authStatus
    );

    const {
		data: preOrdersList,
		error: preOrdersError,
		isLoading: isPreOrdersLoading,
		mutate: mutatePreOrders
	} = useUserData(
        "preOrders",
        authStatus
    );

    useEffect(()=> {
        const updateStatus = (status: AuthStatus)=> {
            setAuthStatus(status);
        }

        if (isUserLoading) {
            updateStatus("loading");
            return;
        }

        if (user && !userError) {
            updateStatus("authenficated");
            return;
        }

        updateStatus("unauthenficated");
    }, [
        user, userError, isUserLoading, 
        mutateOrders, mutateBasket
    ]);

    useEffect(() => {
        if (authStatus !== "authenficated" || 
            !user || 
            mergedGuestBasketForUser.current === user.id
        ) {
            return;
        }
        mergedGuestBasketForUser.current = user.id;

        const mergeGuestBasket = async () => {
            try {
                const guestBasket = await guestBasketApi.getBasket();
                for (const item of guestBasket.data) {
                    if (!item.good_register_id) continue;
                    try {
                        await basketApi.addItem({ good_register_id: item.good_register_id, quantity: item.quantity });
                        LocalBasketService.remove(item.good_register_id);
                    } catch {
                        // Keep only the unavailable line in the guest cookie so a
                        // later retry cannot duplicate already-merged items.
                    }
                }
                await mutateBasket();
            } catch {
                // A transient validation failure must not discard the guest basket.
            }
        };
        void mergeGuestBasket();
    }, [authStatus, user, mutateBasket]);

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

                preOrdersList: preOrdersList,
                isPreOrdersLoading: isPreOrdersLoading,
                preOrdersError: preOrdersError,

                setNotification,
                setPopUpWindow,
                setMouseText,
                setMouseGuide,
                setLogFormData,
                setRegFormData,
                setAuthStatus,

                mutateUser,
                mutateBasket,
                mutateOrders,
                mutatePreOrders
            }}
        >
            <Suspense fallback={null}>
                <TokenVerifier
                    setNotification={setNotification}
                    setAuthStatus={setAuthStatus}
                />
            </Suspense>
            {children}
        </GlobalContext.Provider>
    )
};
