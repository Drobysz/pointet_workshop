import { motion } from "framer-motion";
import { MotionComponent } from "./ViewReveal.props";

const motionTags = {
    div: motion.div,
    section: motion.section,
    article: motion.article,
    aside: motion.aside,
    header: motion.header,
    footer: motion.footer,
    main: motion.main,
    nav: motion.nav,
    ul: motion.ul,
    li: motion.li,
    p: motion.p,
    span: motion.span,
    h1: motion.h1,
    h2: motion.h2,
    h3: motion.h3,
} as unknown as Record<string, MotionComponent>;;

export default motionTags;