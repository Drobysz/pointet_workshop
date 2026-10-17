import { ReactNode } from "react"
import { ProfileHeader } from "./layout_components";
import { GridContainer } from "@/components";

export default function ProfileLayout ({
    children
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <main className="min-h-screen py-13">
            <GridContainer innerClassName="px-4">
                <ProfileHeader />
                <div>
                    {children}
                </div>
            </GridContainer>
        </main>
    )
}