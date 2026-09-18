import { ServiceType } from "@/types";
import { z } from "zod";

// const numberFromInput = (schema: z.ZodType<number>) =>
//     z.preprocess(
//         (value) => value === "" ? undefined : value,
//         schema,
//     );

// const emptyToUndefined = (schema: z.ZodTypeAny) =>
//     z.preprocess(
//         (value) => value === "" ? undefined : value,
//         schema.optional()
//     );

export const ContactFormScheme = z.object({
    service: z.enum([
        "custom hand bag knitting",
        "your furniture restoration",
    ], {
        message: "Select a material",
    }),

    description: z
        .string()
        .trim()
        .min(10, "The description must contain at least 10 characters"),
});

export type FormError = {
    service?: string,
    description?: string;
};

export type FormState = {
    errors?: FormError,
    message?: string,
    success?: boolean
    redirectLink?: string;
};
