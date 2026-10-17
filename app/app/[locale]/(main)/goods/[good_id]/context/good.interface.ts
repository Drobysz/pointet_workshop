import { ProductColor } from "@/api/types/colors";
import { Dispatch, SetStateAction } from "react";

export interface GoodContextInterface {
    currentColor: ProductColor;

    currentColorId: number;
    setCurrentColorId: Dispatch<SetStateAction<number>>;

    currentInventoryId: number | null;
    setCurrentInventoryId: Dispatch<SetStateAction<number | null>>;

    currentQuantity: number;
    setCurrentQuantity: Dispatch<SetStateAction<number>>;
}
