import { z } from "zod";

const email = z.string()
        .trim()
        .min(1, { message: "Email is required" })
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Email format is invalid"
        );

export const RegisterFormScheme = z.object({
    full_name: z
        .string()
        .min(4, { message: "Min length is 4 symbols" })
        .trim(),
    email: email,
    address: z.preprocess((v)=>
        v == "" ? undefined : v,
        z.coerce
            .string()
            .optional()
        ),
    password: z
        .string()
        .min(8, { message: "Min length is 8 symbols" })
        .regex(/\p{L}/u, { message: "At least one letter's required" })
        .regex(/\p{N}/u, { message: "At least one number's required" })
        .refine((value) => new TextEncoder().encode(value).length <= 72, {
            message: "password_max_length",
        })
        .trim(),
});

export const LoginFormScheme = z.object({
    email: email,
    password: z
        .string()
        .min(1, { message: "password is required" })
        .trim(),
});

export const  UpdatePasswordSchemes =  z.object({
    current_password: z
        .string()
        .min(1, { message: "password is required" })
        .trim(),

    new_password: z
        .string()
        .min(8, { message: "Min length is 8 symbols" })
        .regex(/\p{L}/u, { message: "At least one letter's required" })
        .regex(/\p{N}/u, { message: "At least one number's required" })
        .refine((value) => new TextEncoder().encode(value).length <= 72, {
            message: "password_max_length",
        })
        .trim(),
});

export const userFieldSchemas = {
    email: z
        .email("Invalid email address."),

    tel: z
        .string()
        .regex(
            /^\+?[0-9\s()-]{7,20}$/,
            "Invalid phone number."
        ),
    address: z
        .string()
        .regex(
            /^[^,]+,\s*[^,]+,\s*[A-Za-z0-9 -]+,\s*[^,]+$/,
            "Address must be: Street, City, Postal code, Country"
        )
};

export type UserField = keyof typeof userFieldSchemas;

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
