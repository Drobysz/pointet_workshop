"use client"

import { useEffect, useState } from "react";

export const useWindowWidth = (triggerValue?: number)=> {
    const [width, setWidth] = useState(0);

    useEffect(()=> {
        const onResize = ()=> setWidth(window.innerWidth);
        onResize();
        window.addEventListener("resize", onResize);

        return ()=> window.removeEventListener("resize", onResize);
    },[]);

    if (triggerValue) {
        return width > triggerValue;
    }

    return width;
};