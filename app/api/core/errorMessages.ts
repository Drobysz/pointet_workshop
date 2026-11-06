import { ApiErrorMessages } from "../core/apiErrorMessage";

export const registerErrorMessages = {
    400: "errors.register.badRequest",
    409: "errors.register.conflict",
    422: "errors.register.invalidDetails",
    429: "errors.register.tooManyAttempts",
} satisfies ApiErrorMessages;


export const verifyErrorMessages = {
    400: "errors.verify.badRequest",
    401: "errors.verify.invalidToken",
    404: "errors.verify.notFound",
    409: "errors.verify.alreadyUsed",
    422: "errors.verify.expired",
    429: "errors.verify.tooManyAttempts",
} satisfies ApiErrorMessages;


export const loginErrorMessages = {
    400: "errors.login.badRequest",
    401: "errors.login.invalidCredentials",
    403: "errors.login.forbidden",
    422: "errors.login.invalidDetails",
    429: "errors.login.tooManyAttempts",
} satisfies ApiErrorMessages;


export const refreshErrorMessages = {
    401: "errors.default.sessionExpired",
    403: "errors.refresh.forbidden",
    429: "errors.default.tooManyRequests",
} satisfies ApiErrorMessages;


export const logoutErrorMessages = {
    401: "errors.logout.notSignedIn",
    403: "errors.logout.forbidden",
    429: "errors.default.tooManyRequests",
} satisfies ApiErrorMessages;


export const emailChangeErrorMessages = {
    401: "errors.default.sessionExpired",
    403: "errors.emailChange.forbidden",
    409: "errors.emailChange.unavailable",
    422: "errors.emailChange.taken",
    429: "errors.emailChange.tooManyAttempts",
    502: "errors.emailChange.notSent",
} satisfies ApiErrorMessages;


export const emailChangeVerificationErrorMessages = {
    401: "errors.default.sessionExpired",
    403: "errors.emailVerification.forbidden",
    404: "errors.emailVerification.notFound",
    409: "errors.emailChange.unavailable",
    422: "errors.emailVerification.invalidCode",
    429: "errors.verify.tooManyAttempts",
    500: "errors.emailVerification.server",
} satisfies ApiErrorMessages;


export const passwordChangeErrorMessages = {
    401: "errors.default.sessionExpired",
    403: "errors.passwordChange.forbidden",
    404: "errors.passwordChange.userNotFound",
    422: "errors.passwordChange.invalid",
    429: "errors.passwordChange.tooManyAttempts",
    500: "errors.passwordChange.server",
} satisfies ApiErrorMessages;


export const basketErrorMessages = {
    getBasket: {
        401: "errors.basket.get.unauthorized",
        500: "errors.basket.get.server",
    } satisfies ApiErrorMessages,

    addItem: {
        400: "errors.basket.invalidItem",
        401: "errors.basket.add.unauthorized",
        404: "errors.basket.add.notFound",
        409: "errors.basket.add.conflict",
        422: "errors.basket.add.invalidOptions",
        500: "errors.basket.add.server",
    } satisfies ApiErrorMessages,

    updateItem: {
        400: "errors.basket.invalidItem",
        401: "errors.basket.update.unauthorized",
        403: "errors.basket.update.forbidden",
        404: "errors.basket.itemNotFound",
        422: "errors.basket.update.invalidOptions",
        500: "errors.basket.update.server",
    } satisfies ApiErrorMessages,

    deleteItem: {
        401: "errors.basket.remove.unauthorized",
        403: "errors.basket.remove.forbidden",
        404: "errors.basket.itemNotFound",
        500: "errors.basket.remove.server",
    } satisfies ApiErrorMessages,
};
