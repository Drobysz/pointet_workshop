import { BasketItem } from "@/api/types/basket";
import { Order } from "@/api/types/orders";
import { User } from "@/api/types/user";
import { LoginForm, RegisterForm } from "@/types/auth";
import { Dispatch, SetStateAction } from "react";
import { KeyedMutator } from "swr";

export type NotificationStatus = "error" | "alert" | "success" | "none";

export interface AppNotification {
    status: NotificationStatus;
    text: string;
}

export interface Coords {
    x: number;
    y: number;
}

export type PopUpWindow = "LoginForm" | "RegisterForm" | "DeleteWindow" | "VerifyCodeWindow" | "none";
export type AuthStatus = "authenficated" | "unauthenficated" | "loading";

export interface GlobalContextInterface {
    logFormData: LoginForm,
    regFormData: RegisterForm,
    authStatus: AuthStatus,

    notification: AppNotification;
    blur: boolean;
    popUpWindow: PopUpWindow;
    mouseText: string,
    mouseGuide: Coords | null;
    isMouseVisible: boolean,

    user?: User;
    isUserLoading: boolean;
    userError?: Error;

    basketList?: BasketItem[];
    isBasketLoading: boolean;
    basketError?: Error;

    ordersList?: Order[];
    isOrdersLoading: boolean;
    ordersError?: Error;

    setLogFormData: Dispatch<SetStateAction<LoginForm>>,
    setRegFormData: Dispatch<SetStateAction<RegisterForm>>,

    setAuthStatus: Dispatch<SetStateAction<AuthStatus>>,
    mutateUser: KeyedMutator<User>;
    mutateBasket: KeyedMutator<BasketItem[]>;
    mutateOrders: KeyedMutator<Order[]>;

    setNotification: Dispatch<SetStateAction<AppNotification>>;
    setPopUpWindow: Dispatch<SetStateAction<PopUpWindow>>;
    setMouseText: Dispatch<SetStateAction<string>>;
    setMouseGuide: Dispatch<SetStateAction<Coords | null>>;
}
