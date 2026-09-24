"use client";

import { MainBtn } from "@/components";
import s from "./style.module.scss";
import {
    ProfileIcon,
    LangaugeOption,
} from "./_components";

export const Profile = ()=> {
    return (
        <div
            className={s.profile_section}
        >
            <LangaugeOption />
            <ProfileIcon />
            <MainBtn>
                Sign Up
            </MainBtn>
        </div>
    )
}
