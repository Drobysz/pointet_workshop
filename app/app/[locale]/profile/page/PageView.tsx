"use client";

import { useContext } from "react";
import s from "./style.module.scss";
import { GlobalContext } from "../../context/global.context";
import {
    FullnameSection,
    LogOutSection,
} from "./_sections";
import {
    Loading,
    InputForm,
    FormSectionTitle,
} from "./_components"
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import {
    Divider
} from "@/components"
import { userApi } from "@/api/api";

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
                        <div className="flex flex-col gap-4 max-w-200 w-full">
                            <FormSectionTitle>
                                Personal information
                            </FormSectionTitle>

                            <InputForm
                                userId={user.id}
                                label="email"
                                initialValue={user.email}
                                param="email"
                                inputType="email"
                                request={userApi.updateUser}
                            />

                            <InputForm
                                userId={user.id}
                                label="phone number"
                                initialValue={user.tel ?? ""}
                                param="tel"
                                request={userApi.updateUser}
                            />
                        </div>

                        <Divider />

                        <div className="flex flex-col gap-5 max-w-200 w-full">
                            <FormSectionTitle>
                                Security
                            </FormSectionTitle>
                        </div>

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
