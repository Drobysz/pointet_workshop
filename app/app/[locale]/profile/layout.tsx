"use client";

import { ReactNode } from "react"
import { ProfileHeader } from "./layout_components";
import { GridContainer } from "@/components";
import s from "./layout.module.scss";

export default function ProfileLayout ({
    children
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <main className="min-h-screen py-13">
            <GridContainer innerClassName="px-4">
                <ProfileHeader />
                <section className={s.profile_section_frame}>
                    {children}
                </section>
            </GridContainer>
        </main>
    )
}
