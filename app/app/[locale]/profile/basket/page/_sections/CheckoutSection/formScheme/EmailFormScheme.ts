import { z } from "zod";
import type { AppTranslator } from "@/i18n/types";

export const createEmailFormScheme = (t: AppTranslator) => z.object({
    email: z.string()
        .trim()
        .min(1, { message: t("validation.emailRequired") })
        .regex(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            t("validation.emailInvalid")
        )
});
