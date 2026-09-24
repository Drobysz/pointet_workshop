"use client";

import { useId, useRef, useState } from "react";
import s from "./style.module.scss";

import { UserRound } from "lucide-react";
import { cn } from "@/helpers";
import ProfileMenu from "./ProfileMenu/ProfileMenu";
import { AnimatePresence } from "framer-motion";
import { useDismiss } from "@/hooks/useDismiss";

export const ProfileIcon = ()=> {
    const [hover, setHover] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const popupId = useId();
	const triggerRef = useRef<HTMLDivElement | null>(null);
	const popupRef = useRef<HTMLDivElement | null>(null);

    useDismiss({
        isOpen,
        refs: [triggerRef, popupRef],
        onDismiss: ()=> setIsOpen(false)
    });

    return (
        <div className="relative">
            <div
                className={s.profile_icon_container}
                ref={triggerRef}
                onMouseEnter={()=> setHover(true)}
                onMouseLeave={()=> setHover(false)}
                onClick={()=> setIsOpen(p => !p)}

                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={popupId}
                aria-label="Profile menu"

            >
                <UserRound
                    className={cn(
                        s.profile_icon,
                        (hover || isOpen) && "text-red-900!"
                    )}
                />
                <div
                    className={s.profile_background}
                />
                <div
                    className={cn(
                        s.profile_background,
                        s.profile_icon_cover_background,
                        (hover || isOpen) && s.profile_icon_hovered,
                    )}
                />
            </div>
            <AnimatePresence>
                {isOpen &&
                    <ProfileMenu
                        ref={popupRef}
                        setIsOpen={setIsOpen}
                        email="test@axample.com"
                        full_name="Alex Drobysz"
                    />
                }
            </AnimatePresence>
        </div>
    )
}
