import { cn } from "@/helpers/cn";
import { GridContainerInterface } from "./GridContainer.props";
import s from "./style.module.scss";

export const GridContainer = ({
    outerClassName,
    innerClassName,
    children,
    ...props
}: GridContainerInterface)=> {
    return (
        <section
            className={cn(
                outerClassName,
                s.wrapper,
            )}
        >
            <div
                {...props}
                className={cn(
                    innerClassName,
                    s.main,
                )}
            >
                {children}
            </div>
        </section>
    )
}
