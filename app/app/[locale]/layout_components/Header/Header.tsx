"use client";

import { GridContainer } from "@/components"
import s from "./style.module.scss";
import {
    Navigation,
    HeaderWrapper,
    Logo,
} from "./_components";
import { MainBtn } from "@/components";

export const Header = ()=> {
    return (
        <HeaderWrapper>
            <GridContainer
                outerClassName={s.header_wrapper}
                innerClassName={s.header_container}
            >
                <Logo />
                <Navigation />
                <div>
                    <MainBtn 
                        className="justify-self-end"
                    >
                        Sign Up
                    </MainBtn>
                </div>
            </GridContainer>
        </HeaderWrapper>
    )
}
