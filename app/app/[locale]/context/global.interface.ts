import { Dispatch, SetStateAction } from "react";

export type NotificationStatus = "error" | "alert" | "success" | "none";

export interface AppNotification {
    status: NotificationStatus;
    text: string;
}

export interface Coords {
    x: number;
    y: number;
}

export interface GlobalContextInterface {
    notification: AppNotification;
    blur: boolean;
    popUpWindow: string;
    mouseText: string,
    mouseGuide: Coords | null;
    isMouseVisible: boolean,

    setNotification: Dispatch<SetStateAction<AppNotification>>;
    setPopUpWindow: Dispatch<SetStateAction<string>>;
    setMouseText: Dispatch<SetStateAction<string>>;
    setMouseGuide: Dispatch<SetStateAction<Coords | null>>;
}
