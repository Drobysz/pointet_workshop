import { Transition } from "framer-motion";

export const variants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export const transition: Transition = {
    duration: 0.3,
    ease: "easeInOut",
}