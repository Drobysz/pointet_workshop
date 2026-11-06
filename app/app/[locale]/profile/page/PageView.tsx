"use client";

import { useContext, useEffect } from "react";
import s from "./style.module.scss";
import { GlobalContext } from "../../context/global.context";
import {
    FullnameSection,
    PersonalInfoSection,
    SecuritySection,
    LogOutSection,
} from "./_sections";
import { Loading } from "../layout_components/Loading/Loading";
import { Divider } from "@/components";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/helpers";
import { jersey10 } from "@/fonts/fonts";
import { useTranslations } from "next-intl";

const ProfilePageView = ()=> {
    const t = useTranslations("profile.page");
    const router = useRouter();

    const {
        user,
        userError,
        isUserLoading,
        authStatus,

        setNotification
    } = useContext(GlobalContext); 

    const isDataLoaded = user && !userError;

    useEffect(()=> {
        if (userError) {
            const redirectNonAuthUser = setTimeout(() => {
                setNotification({
                    status: "alert",
                    text: t("redirectedNotice")
                });

                router.push("/home");
            }, 3000);

            return ()=> clearTimeout(redirectNonAuthUser);
        }
    }, [userError, router, setNotification, t]);

    return (
        <div>
            {userError && 
                <h1
                    className={cn(
                        jersey10.className, 
                        s.error_title
                    )}
                >
                    {authStatus == "authenficated" 
                        ? t("loadFailed")
                        : t("notLoggedIn")
                    }
                </h1>
            }
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
            {isUserLoading && <Loading />}
        </div>
    )
}

export default ProfilePageView;
