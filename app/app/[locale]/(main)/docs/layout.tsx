import { SideMenu } from "./layout/index";
import s from "./layout/GridLayout.module.scss";

export default function DocsLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <div className={s.wrapper}>
            <SideMenu 
                className={s.aside}
            />
            <section className={s.page}>
                {children}
            </section>
        </div>
    )
}
