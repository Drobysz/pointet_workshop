import { z } from "zod";
import type { AppTranslator } from "@/i18n/types";
import { GlobalFormState } from "@/auth/FormSchemes";

const FULL_NAME_MIN_LENGTH = 4;
const ADDRESS_MIN_LENGTH = 10;

export const createBasketFormScheme = (t: AppTranslator) => z.object({
    email: z.string()
        .trim()
        .min(1, { message: t("validation.emailRequired") })
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            t("validation.emailInvalid")
        ),
    full_name: z
            .string()
            .min(FULL_NAME_MIN_LENGTH, {
                message: t("validation.minLength", { count: FULL_NAME_MIN_LENGTH }),
            })
            .trim(),
    address: z
            .string()
            .min(ADDRESS_MIN_LENGTH, {
                message: t("validation.minLength", { count: ADDRESS_MIN_LENGTH }),
            })
            .trim(),
});

export type BasketFormError = {
    full_name?: string[];
    email?: string[];
    address?: string[];
};

export type BasketRequestData = {
    full_name?: string;
    email?: string;
    address?: string;
};

export type BasketFormState = GlobalFormState<BasketFormError>;
