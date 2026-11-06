import type { SellerApplication, SellerRequestType } from "@/api/types/seller";
import type { AppTranslator } from "@/i18n/types";
import { z } from "zod";

const EMAIL_MAX_LENGTH = 255;

export const createContactFormScheme = (t: AppTranslator) => {
    const requiredText = (
        field: string, 
        maxLength: number
    ) => z.string()
        .trim()
        .min(1, t("seller.validation.required", { field }))
        .max(maxLength, t("seller.validation.tooLong", { field, max: maxLength }));

    return z.object({
        first_name: requiredText(t("seller.form.labels.firstName"), 100),
        last_name: requiredText(t("seller.form.labels.lastName"), 100),
        tel_number: z.string()
            .trim()
            .regex(/^\+?[1-9][0-9]{6,14}$/, t("seller.validation.phoneInvalid")),
        country: requiredText(t("seller.form.labels.country"), 100),
        email: z.string()
            .trim()
            .max(EMAIL_MAX_LENGTH, t("seller.validation.tooLong", {
                field: t("seller.form.labels.email"),
                max: EMAIL_MAX_LENGTH,
            }))
            .pipe(z.email(t("validation.emailInvalid"))),
        brand_name: requiredText(t("seller.form.labels.brandName"), 160),
        company_address: requiredText(t("seller.form.labels.companyAddress"), 500),
        description_of_contact: requiredText(t("seller.form.labels.contactDetails"), 4000),
        description_of_brand: requiredText(t("seller.validation.brandDescriptionField"), 4000),
        // false is valid: applications are also accepted from outside the EU.
        is_resident_of_eu: z.boolean(),
    }) satisfies z.ZodType<SellerRequestType>;
};

export type FormError = Partial<Record<keyof SellerRequestType, string>>;

export type FormState = {
    errors?: FormError;
    message?: string;
    success?: boolean;
    application?: SellerApplication;
};
