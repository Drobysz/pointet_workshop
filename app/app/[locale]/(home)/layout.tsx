import { Metadata } from "next";
import { ReactNode } from "react";
import {
    SmoothScrollContextProvider
} from "./smooth_scroll_context/SmoothScroll";
import {
    ScrollToTopBtn,
} from "./layout_components/index";

export const metadata: Metadata = {
  title: "Home Page",
  description: "Workshop of Pointet Family",
};

export default function HomeLayout ({
    children
}: {
    children: ReactNode;
}) {
    return (
        <SmoothScrollContextProvider>
            {children}
            <ScrollToTopBtn />
        </SmoothScrollContextProvider>
    )
}
