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


export const emailChangeErrorMessages = {
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to change this email address.",
    409: "This email address cannot be used.",
    422: "The email has already been taken.",
    429: "Too many email change requests. Please try again later.",
    502: "The verification email could not be sent. Please try again later.",
} satisfies ApiErrorMessages;


export const emailChangeVerificationErrorMessages = {
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to verify this email address.",
    404: "No pending email change was found.",
    409: "This email address cannot be used.",
    422: "The verification code is invalid or has expired.",
    429: "Too many verification attempts. Please try again later.",
    500: "The email address could not be updated. Please try again later.",
} satisfies ApiErrorMessages;


export const passwordChangeErrorMessages = {
    401: "Your session has expired. Please sign in again.",
    403: "You do not have permission to change this password.",
    404: "The user could not be found.",
    422: "The current password is incorrect or the new password is invalid.",
    429: "Too many password change attempts. Please try again later.",
    500: "The password could not be changed. Please try again later.",
} satisfies ApiErrorMessages;


export const basketErrorMessages = {
    getBasket: {
        401: "You must be logged in to view your basket.",
        500: "Failed to load the basket. Please try again later.",
    } satisfies ApiErrorMessages,

    addItem: {
        400: "Invalid basket item data.",
        401: "You must be logged in to add items to your basket.",
        404: "The selected product or option was not found.",
        409: "This item is already in your basket.",
        422: "The selected product options or quantity are invalid.",
        500: "Failed to add the item to your basket. Please try again later.",
    } satisfies ApiErrorMessages,

    updateItem: {
        400: "Invalid basket item data.",
        401: "You must be logged in to update your basket.",
        403: "You are not allowed to modify this basket item.",
        404: "The basket item was not found.",
        422: "The selected quantity or product options are invalid.",
        500: "Failed to update the basket item. Please try again later.",
    } satisfies ApiErrorMessages,

    deleteItem: {
        401: "You must be logged in to remove items from your basket.",
        403: "You are not allowed to remove this basket item.",
        404: "The basket item was not found.",
        500: "Failed to remove the item from your basket. Please try again later.",
    } satisfies ApiErrorMessages,
};