"use client";

import s from "./style.module.scss";
import {
    Minus,
    Plus
} from "lucide-react";

export const QuantityCounter = ({
    maxQuantity,
    quantity,
    setQuantity,
}: {
    maxQuantity: number;
    quantity: number;
    setQuantity: (quantity: number) => void;
})=> {
    const addQuantity = ()=> {
        setQuantity(Math.min(maxQuantity, quantity + 1));
    };

    const removeQuantity = ()=> {
        setQuantity(Math.max(0, quantity - 1));
    };

    return (
        <div className={s.counter}>
            <button 
                className={s.counter__btn}
                onClick={removeQuantity}
            >
                <span className={s.counter__btn_centralize}>
                    <Minus 
                        className="w-5 h-5"
                    />
                </span>
            </button>

            <span className={s.counter__number}>
                {quantity}
            </span>

            <button 
                className={s.counter__btn}
                onClick={addQuantity}
            >
                <span className={s.counter__btn_centralize}>
                    <Plus 
                        className="w-5 h-5"
                    />
                </span>
            </button>
        </div>
    )
}
