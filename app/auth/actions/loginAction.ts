import z from "zod";
import { FormState, LoginFormScheme } from "../FormSchemes";
import { authApi } from "@/api/api";
import { LoginForm } from "@/types/auth";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { loginErrorMessages } from "@/api/core/errorMessages";

export async function loginAction (_: FormState, formData: FormData) {
    const parsed = LoginFormScheme.safeParse({
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
        const message = getApiErrorMessage(error, loginErrorMessages)

        return {
            message: message,
            success: false,
        }
    }

    if (!response.data.authenticated) {
        return {
            errors: {
                email: "Failed to log in",
            },
            message: "Failed to log in",
            success: false,
        }
    }

    return { 
        success: true,
        message: "Successfully logged in" 
    };
};
