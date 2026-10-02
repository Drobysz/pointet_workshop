import { ApiErrorMessages } from "../core/apiErrorMessage";

export const registerErrorMessages = {
    400: "The registration request is invalid.",
    409: "An account with these details already exists.",
    422: "Please check the registration details.",
    429: "Too many registration attempts. Please try again later.",
} satisfies ApiErrorMessages;


export const verifyErrorMessages = {
    400: "The verification request is invalid.",
    401: "The verification token is invalid.",
    404: "The verification request could not be found.",
    409: "This verification link has already been used.",
    422: "The verification link is invalid or has expired.",
    429: "Too many verification attempts. Please try again later.",
} satisfies ApiErrorMessages;


export const loginErrorMessages = {
    400: "The login request is invalid.",
    401: "Incorrect email or password.",
    403: "You are not allowed to sign in to this account.",
    422: "Please check your email and password.",
    429: "Too many login attempts. Please try again later.",
} satisfies ApiErrorMessages;


export const refreshErrorMessages = {
    401: "Your session has expired. Please sign in again.",
    403: "Your session cannot be renewed.",
    429: "Too many requests. Please try again later.",
} satisfies ApiErrorMessages;


export const logoutErrorMessages = {
    401: "You are no longer signed in.",
    403: "You are not allowed to perform this action.",
    429: "Too many requests. Please try again later.",
} satisfies ApiErrorMessages;
