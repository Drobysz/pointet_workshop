import type { ReactNode } from "react";
import s from "./legal.module.scss";

type LegalSectionProps = {
    id: string;
    number: number;
    title: string;
    children: ReactNode;
};

export function LegalSection({ id, number, title, children }: LegalSectionProps) {
    return (
        <section id={id} className={s.section} aria-labelledby={`${id}-title`}>
            <h2 id={`${id}-title`}>{number}. {title}</h2>
            {children}
        </section>
    );
}
