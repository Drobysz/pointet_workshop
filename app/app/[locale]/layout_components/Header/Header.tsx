"use client";

import { GridContainer } from "@/components"
import s from "./style.module.scss";
import { after } from "@/fonts/fonts";
import { cn } from "@/helpers/cn";
import {
    Navigation,
    HeaderWrapper,
} from "./_components";
import { MainBtn } from "@/components";

export const Header = ()=> {
    

    return (
        <HeaderWrapper>
            <GridContainer
                outerClassName={s.header_wrapper}
                innerClassName={s.header_container}
            >
                <p 
                    className={cn(
                        after.className,
                        s.logo_title
                    )}
                >
                    Pointet
                </p>

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
