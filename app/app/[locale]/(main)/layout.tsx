import { ReactNode } from "react";
import s from "./layout.module.scss";

export default function MainLayout({
    children
}: Readonly<{
  children: ReactNode;
}>) {
    return (
        <main className={s.wrapper}>
            <div className={s.main}>
                {children}
            </div>
        </main>
    )
}
