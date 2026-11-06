import { z } from "zod";
import type { AppTranslator } from "@/i18n/types";

const PASSWORD_MIN_LENGTH = 8;
const FULL_NAME_MIN_LENGTH = 4;

const createEmailScheme = (t: AppTranslator) => z.string()
        .trim()
        .min(1, { message: t("validation.emailRequired") })
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            t("validation.emailInvalid")
        );

const createNewPasswordScheme = (t: AppTranslator) => z
        .string()
        .min(PASSWORD_MIN_LENGTH, {
            message: t("validation.minLength", { count: PASSWORD_MIN_LENGTH }),
        })
        .regex(/\p{L}/u, { message: t("validation.passwordLetter") })
        .regex(/\p{N}/u, { message: t("validation.passwordNumber") })
        .refine((value) => new TextEncoder().encode(value).length <= 72, {
            message: t("validation.passwordTooLong"),
        })
        .trim();

const createCurrentPasswordScheme = (t: AppTranslator) => z
        .string()
        .min(1, { message: t("validation.passwordRequired") })
        .trim();

export const createRegisterFormScheme = (t: AppTranslator) => z.object({
    full_name: z
        .string()
        .min(FULL_NAME_MIN_LENGTH, {
            message: t("validation.minLength", { count: FULL_NAME_MIN_LENGTH }),
        })
        .trim(),
    email: createEmailScheme(t),
    address: z.preprocess((v)=>
        v == "" ? undefined : v,
        z.coerce
            .string()
            .optional()
        ),
    password: createNewPasswordScheme(t),
});

export const createLoginFormScheme = (t: AppTranslator) => z.object({
    email: createEmailScheme(t),
    password: createCurrentPasswordScheme(t),
});

export const createUpdatePasswordScheme = (t: AppTranslator) => z.object({
    current_password: createCurrentPasswordScheme(t),
    new_password: createNewPasswordScheme(t),
});

export const createUserFieldSchemas = (t: AppTranslator) => ({
    email: z
        .email(t("validation.emailInvalid")),

    tel: z
        .string()
        .regex(
            /^\+?[0-9\s()-]{7,20}$/,
            t("validation.phoneInvalid")
        ),
    address: z
        .string()
        .regex(
            /^[^,]+,\s*[^,]+,\s*[A-Za-z0-9 -]+,\s*[^,]+$/,
            t("validation.addressFormat")
        )
});

export type UserField = keyof ReturnType<typeof createUserFieldSchemas>;

export type FormError = {
    full_name?: string;
    email?: string;
    address?: string;
    password?: string;
};

export type UpdatePasswordFormError = {
    current_password?: string;
    new_password?: string;
};


export type FormState = {
    errors?: FormError;
    message?: string;
    success?: boolean;
};

export type UpdatePasswordFormState = {
    errors?: UpdatePasswordFormError;
    message?: string;
    success?: boolean;
}
