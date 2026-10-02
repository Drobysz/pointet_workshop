import { motion } from "framer-motion";
import { CursorProps } from "../../types";
import s from "./style.module.scss";

export const Cursor = ({ position }: CursorProps)=> {
    return (
        <motion.span
            animate={{
                ...position,
            }}
            className={s.cursor}
        />
    );
};
