"use client";

import { Transition, Variants } from "framer-motion";
import motionTags from "./motionsTags";
import { 
	ViewRevealProps,
	AnimationType,
} from "./ViewReveal.props";

export const ViewReveal = ({
    as = "div",
    children,
    className,
	animationType = "blurred",
	...props
}: ViewRevealProps) => {

    const Component = motionTags[as];

	const transLib: Record<AnimationType, Transition> = {
		"blurred": {
			duration: 0.5,
			ease: [0.76, 0, 0.24, 1]
		},

		"disclosure": {
			duration: 1.3,
			ease: [0.33, 1, 0.68, 1]
		}
	}

	const animLib: Record<AnimationType, Variants> = {
		"blurred": {
			"initial": {
				y: 50,
				filter: "blur(10px)"
			},

			"appear": {
				y: 0,
				filter: "blur(0px)"
			}
		},

		"disclosure": {
			"initial": {
				clipPath: "inset(48% 48% 48% 48% round 24px)"
			},

			"appear": {
				clipPath: "inset(0% 0% 0% 0% round 24px)",
			}
		},
	}

    return (
        <Component
			{...props}
            className={className}

            viewport={{
				once: true,
			}}
			initial="initial"
			whileInView="appear"
			variants={animLib[animationType]}
			transition={transLib[animationType]}
        >
            {children}
        </Component>
    );
};
