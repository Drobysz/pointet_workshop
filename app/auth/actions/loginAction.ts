import z from "zod";
import { FormState, createLoginFormScheme } from "../FormSchemes";
import { authApi } from "@/api/api";
import { LoginForm } from "@/types/auth";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { loginErrorMessages } from "@/api/core/errorMessages";
import type { AppTranslator } from "@/i18n/types";

export async function loginAction (
    t: AppTranslator,
    _: FormState,
    formData: FormData
) {
    const parsed = createLoginFormScheme(t).safeParse({
        email:        formData.get('email'),
        password:   formData.get('password')
    });

    if (!parsed.success) {
        const errors = z.flattenError(parsed.error).fieldErrors;

        return { 
            errors: {
                email:      errors.email?.[0],
                password:   errors.password?.[0],
            }
        }
    }

    const loginRequestData: LoginForm = {
        email: parsed.data.email,
        password: parsed.data.password,
    }

    let response;

    try {
        response = await authApi.login(loginRequestData)
    } catch (error) {
        const message = getApiErrorMessage(error, t, loginErrorMessages)

        return {
            message: message,
            success: false,
        }
    }

    if (!response.data.authenticated) {
        return {
            errors: {
                email: t("auth.login.failed"),
            },
            message: t("auth.login.failed"),
            success: false,
        }
    }

    return { 
        success: true,
        message: t("auth.login.success")
    };
};
