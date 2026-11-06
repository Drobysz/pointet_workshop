import { sellerApi } from "@/api/api";
import { ApiError } from "@/api/core/ApiError";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import type { AppTranslator } from "@/i18n/types";
import { createContactFormScheme } from "./FormScheme";
import type { FormError, FormState } from "./FormScheme";
import { z } from "zod";

export async function contactAction(
    t: AppTranslator,
    _: FormState,
    formData: FormData
): Promise<FormState> {
    const residency = formData.get("is_resident_of_eu");
    const parsed = createContactFormScheme(t).safeParse({
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        tel_number: formData.get("tel_number"),
        country: formData.get("country"),
        email: formData.get("email"),
        brand_name: formData.get("brand_name"),
        company_address: formData.get("company_address"),
        description_of_contact: formData.get("description_of_contact"),
        description_of_brand: formData.get("description_of_brand"),
        // Unchecked checkboxes are omitted from FormData, but the API always
        // requires an explicit boolean. Do not coerce the string "false".
        is_resident_of_eu: residency === "on" || residency === "true" || residency === "1",
    });

    if (!parsed.success) {
        const fieldErrors = z.flattenError(parsed.error).fieldErrors;

        return {
            errors: Object.fromEntries(
                Object
                    .entries(fieldErrors)
                    .map(([field, messages]) => [field, messages?.[0]])
            ),
            success: false,
            message: t("seller.submission.checkFields"),
        };
    }

    try {
        const response = await sellerApi.createRequest(parsed.data);

        return {
            errors: {},
            success: true,
            message: t("seller.submission.success"),
            application: response.data,
        };
    } catch (error) {
        const errors: FormError = {};
        if (error instanceof ApiError && error.isValidationError()) {
            for (const field of Object.keys(parsed.data) as (keyof typeof parsed.data)[]) {
                const message = error.errors?.[field]?.[0];

                if (message) {
                    errors[field] = message
                };
            }
        }

        return {
            errors,
            success: false,
            message: error instanceof ApiError
                ? getApiErrorMessage(error, t)
                : t("seller.submission.failed"),
        };
    }
}
