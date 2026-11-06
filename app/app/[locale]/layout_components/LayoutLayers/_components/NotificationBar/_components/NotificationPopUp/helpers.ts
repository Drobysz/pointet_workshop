import { Transition, Variants } from "framer-motion";

export const animations: Variants = {
    "initial": {
        opacity: 0,
        x: "-120%"
    },

    "end": {
        opacity: 1,
        x: 0
    },
};

export const transition: Transition = {
    duration: 0.5,
    ease: [0.33, 1, 0.68, 1]
}
