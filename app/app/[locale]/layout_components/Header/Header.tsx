"use client";

import { GridContainer } from "@/components"
import s from "./style.module.scss";
import {
    HeaderWrapper,
    Logo,
    Navigation,
    Profile,
    MobileMenu,
} from "./_components";

export const Header = ()=> {
    return (
        <HeaderWrapper>
            <GridContainer
                outerClassName={s.header_wrapper}
                innerClassName={s.header_container}
            >
                <Logo />
                <Navigation />
                <Profile />
                <MobileMenu />
            </GridContainer>
        </HeaderWrapper>
    )
}
