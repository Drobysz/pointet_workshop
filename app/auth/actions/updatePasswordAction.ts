import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { passwordChangeErrorMessages } from "@/api/core/errorMessages";
import z from "zod";
import { UpdatePasswordFormState, createUpdatePasswordScheme } from "../FormSchemes";
import { userApi } from "@/api/api";
import { Id } from "@/api/types/api";
import type { AppTranslator } from "@/i18n/types";

export const updatePassword = async (
    t: AppTranslator,
    userId: Id,
    _: UpdatePasswordFormState, 
    formData: FormData
)=> {
    const parsed = createUpdatePasswordScheme(t).safeParse({
        current_password: formData.get('current_password'),
        new_password: formData.get('new_password')
    });

    if (!parsed.success) {
        const errors = z.flattenError(parsed.error).fieldErrors;

        return {
            errors: {
                current_password: errors.current_password?.[0],
                new_password: errors.new_password?.[0],
            }
        }
    }

    try {
        await userApi.updatePassword(userId, {
            current_password: parsed.data.current_password,
            new_password: parsed.data.new_password,
        });


    } catch (error) {
        const message = getApiErrorMessage(
            error,
            t,
            passwordChangeErrorMessages
        )
        
        return {
            message: message,
            success: false,
        }
    }

    return {
        success: true,
        message: t("auth.passwordChange.success")
    }
}
