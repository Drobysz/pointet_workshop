"use client"

import { createContext, ReactNode, useState } from "react";
import { AppNotification, Coords, GlobalContextInterface } from "./global.interface";
import { useWindowWidth } from "@/hooks";

const noneNotification
: AppNotification = { 
    status: "none", 
    text: "" 
};

export const GlobalContext = createContext<GlobalContextInterface>({
    notification: noneNotification,
    popUpWindow: "none",
	blur: false,
	mouseText: "",
	mouseGuide: null,
	isMouseVisible: false,

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
    const [notification, setNotification] 
        = useState<AppNotification>(noneNotification);
    const [popUpWindow, setPopUpWindow] = useState("none");
    const [mouseText, setMouseText] = useState("");
	const [mouseGuide, setMouseGuide] = useState<Coords | null>(null);

    const isMouseVisible = useWindowWidth(768) as boolean;
	const blur = popUpWindow !== "none";

    return (
        <GlobalContext.Provider
            value={{
                notification: notification,
                popUpWindow: popUpWindow,
                blur: blur,
                mouseText: mouseText,
                mouseGuide: mouseGuide,
                isMouseVisible: isMouseVisible,


                setNotification,
                setPopUpWindow,
                setMouseText,
                setMouseGuide,
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
};
