import type { Metadata } from "next";
import { ShadowBorderWindow } from "@/components";


export const metadata: Metadata = {
    title: "Test",
    robots: {
        index: false,
        follow: false,
    },
};

export default function TestPage () {
    return (
        <div
            className="p-10 flex flex-col gap-10"
        >
            <div className="flex justify-center">
                <ShadowBorderWindow
                    className=""
                >
                    <div 
                        className="h-80"
                    />
                </ShadowBorderWindow>
            </div>
        </div>
    )
}
