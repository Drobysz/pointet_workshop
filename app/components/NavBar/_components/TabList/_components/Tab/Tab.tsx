import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tabprops } from "../../../../types";
import { motion } from "framer-motion";
import { transition, variants } from "./framer";
import cn from "classnames";
import s from "./Tab.module.scss";
import { UnderlinedLink } from "@/components/UnderlinedLink/UnderlinedLink";
import Triangle from "@/assets/triangle.svg";
import { ChevronDown } from "lucide-react";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { jersey10 } from "@/fonts/fonts";

export const Tab = ({
    children, isActive, 
    href, list,
    isTabListHovered,
    setPosition, 
    setPositionClicked
}: Tabprops)=> {
    const ref = useRef<HTMLDivElement>(null!);
    const [hover, setHover] = useState(false);
    const [clicked, setClicked] = useState(false);

    const isList = list?.length > 0;
    const isDesktop = useWindowWidth(768) as boolean;
    const isListOpen = isList && (isDesktop ? hover : clicked);

    const isHightLighted = (isActive && !isTabListHovered) || hover;
    const tabColor = isHightLighted ? "text-red-900" : "text-neutral-500";

    const handleInteraction = useCallback(
        (action: "hover" | "click")=> {
            const { offsetLeft: left, offsetWidth: width } = ref.current;
            const pos = { left, width };

            switch (action) {
                case "hover":
                    setPosition(pos);
                    break;
            
                case "click":
                    setPositionClicked(pos);
                    break;
            };
        }, [setPosition, setPositionClicked]
    );

    useEffect(()=> {
        if (isActive){
            handleInteraction("hover");
            handleInteraction("click");
        };
    }, [handleInteraction, isActive]);

    useEffect(()=> {
        if (!isActive) return;

        const handleResize = ()=> {
            handleInteraction("hover");
            handleInteraction("click");
        };

        window.addEventListener("resize", handleResize);

        return ()=> {
            window.removeEventListener("resize", handleResize);
        };
    }, [handleInteraction, isActive]);

    useEffect(()=> {
        // if (!isListOpen) return;

        const handleClickOutside = (event: MouseEvent)=> {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setClicked(false);
            };
        };

        document.addEventListener("mousedown", handleClickOutside);

        return ()=> {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isListOpen, clicked]);

    return (
        <div 
            ref={ref}
            className={isList ? s.wrapper_list : s.wrapper_default}
            onMouseEnter={()=> {
                handleInteraction("hover")
                setHover(true)
            }}
            onClick={()=> {
                handleInteraction("click");
                if (!isDesktop) {
                    setClicked(p => !p);
                }
                setHover(false);
            }}
            onMouseLeave={()=> setHover(false)}
        >
            <Link
                href={href ?? "#"}
                className="flex items-center gap-0.5"
            >
                {isList &&
                    <ChevronDown 
                        className={cn(
                            s.chevron,
                            tabColor,
                            "w-5 h-5",
                            isListOpen 
                                ? "rotate-180 transtale-y-0.5" 
                                : "rotate-0 -transtale-y-0.5",
                        )}
                    />
                }
                <span 
                    className={cn(
                        tabColor,
                        s.tab_title,
                        jersey10.className
                    )}
                >
                    {children}
                </span>
            </Link>

            {isList &&
                <div 
                    className="h-9.5 w-20 absolute top-0"
                />
            }

            {isList && 
                <motion.ul
                    hidden={!isListOpen}
                    initial="initial"
                    animate={isListOpen ? "animate" : "initial"}
                    exit="exit"
                    variants={variants}
                    transition={transition}
                    className={s.tab_list}
                >
                    {list.map((item, idx)=> (
                        <UnderlinedLink
                            key={`tab_list_${idx}`}
                            href={item.href ?? "#"}
                            colorLine="dark"
                            className={s.tab_header}
                        >
                            {item.label}
                        </UnderlinedLink>
                    ))}
                    <Triangle 
                        className={s.triangle}
                    />
                </motion.ul>
            }
        </div>
    );
};
