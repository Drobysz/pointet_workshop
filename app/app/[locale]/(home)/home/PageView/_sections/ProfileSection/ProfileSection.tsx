"use client";

import { GridContainer } from "@/components";
import s from "./style.module.scss";
import { cn } from "@/helpers";
import { after, monserrat_regular } from "@/fonts/fonts";
import Image from "next/image";
import { useState } from "react";

export const ProfileSection = ()=> {
    const [hover, setHover] = useState(false);

    return (
        <GridContainer
            outerClassName="px-3 pb-30"
            innerClassName={s.container}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={()=> setHover(false)}
        >
            <div className={s.text_container}>
                <header className={s.header}>
                    <h2 className={cn(
                        s.full_name,
                        after.className
                    )}>
                        Tursinoi Pointet
                    </h2>
                    <p className={cn(
                        s.subtitle,
                        monserrat_regular.className
                    )}>
                        Designer, Pattern Maker and Tailor with 10+ years experience
                    </p>
                </header>

                <p className={s.paragraph}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam id feugiat justo, eu condimentum libero. Nullam aliquam facilisis gravida. Pellentesque quam elit, gravida quis tristique et, lacinia ac eros. Nullam blandit dictum tellus, vitae sodales orci vehicula non. Praesent in libero mattis, eleifend metus sit amet, varius sem. Suspendisse fringilla aliquam vulputate. Mauris nec egestas mauris. Aliquam dapibus sagittis tellus, non rutrum ex. Sed vitae metus et enim condimentum venenatis.
                </p>
            </div>
            <div className={s.image_frame}>
                <Image
                    className="translate-y-4"
                    // src={hover 
                    //     ? "/profile/profile_rotated.png" 
                    //     : "/profile/profile_front.png"}
                    src="/profile/profile_front.png"
                    // height={100}
                    // width={400}
                    fill
                    alt="profile image"
                />
            </div>
        </GridContainer>
    )
}
