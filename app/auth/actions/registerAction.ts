import z from "zod";
import { FormState, RegisterFormScheme } from "../FormSchemes";
import { authApi } from "@/api/api";
import { RegisterRequest } from "@/api/types/auth";
import { getApiErrorMessage } from "@/api/core/apiErrorMessage";
import { registerErrorMessages } from "@/api/core/errorMessages";

export async function registerAction (_: FormState, formData: FormData) {
    const parsed = RegisterFormScheme.safeParse({
        full_name: formData.get("full_name"),
        email: formData.get("email"),
        address: formData.get("address"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        const errors = z.flattenError(parsed.error).fieldErrors;

        return { 
            errors: {
                email: errors.email?.[0],
                full_name: errors.full_name?.[0],
                address: errors.address?.[0],
                password: errors.password?.[0],
            }
        }
    }

    const registerRequstData: RegisterRequest = {
        email:         parsed.data.email,
        full_name:     parsed.data.full_name,
        address:       parsed.data.address,
        password:      parsed.data.password,
    }

    let response;
    
    try {
        response = await authApi.register(registerRequstData);
    } catch (error) {
        const message = getApiErrorMessage(
            error,
            registerErrorMessages,
        );

        return {
            message: message,
            success: false,
        }
    }

    if (!response.status) {
        return {
            success: false,
            message: "Password already exists"
        }
    }

    return { 
        success : true,
        message : "Verification link was sent to your email."
    };
};
