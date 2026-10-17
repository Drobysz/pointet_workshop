"use client";

import { useContext } from "react";
import s from "./style.module.scss";
import { GlobalContext } from "../../context/global.context";
import {
    FullnameSection,
    PersonalInfoSection,
    SecuritySection,
    LogOutSection,
} from "./_sections";
import { Loading } from "./_components"
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import { Divider } from "@/components";

const ProfilePageView = ()=> {
    const {
        user,
        userError,
        isUserLoading
    } = useContext(GlobalContext);

    const isDataLoaded = user && !userError;

    return (
        <section
            className={s.profile_section_frame}
        >
            {isDataLoaded &&
                <>
                    <FullnameSection 
                        full_name={user.full_name}
                        userId={user.id}
                    />

                    <div 
                        className={s.divider}
                    />
                    <div className={s.forms_container}>
                        <PersonalInfoSection 
                            user={user}
                        />

                        <Divider />

                        <SecuritySection 
                            userId={user.id}
                        />

                        <Divider />

                        <LogOutSection />
                    </div>
                </>
            }
            {userError && 
                <h1
                    className={cn(
                        jersey10.className, 
                        s.error_title
                    )}
                >
                    Page failed to load
                </h1>
            }
            {isUserLoading && <Loading />}
        </section>
    )
}

export default ProfilePageView;
