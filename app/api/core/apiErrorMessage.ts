import type { AppTranslator, ErrorMessageKey } from "@/i18n/types";
import { ApiError } from "./ApiError";

/** HTTP status → translation key of the message shown to the user. */
export type ApiErrorMessages = Partial<Record<number, ErrorMessageKey>>;

const defaultErrorMessages: ApiErrorMessages = {
    400: "errors.default.badRequest",
    401: "errors.default.sessionExpired",
    403: "errors.default.forbidden",
    404: "errors.default.notFound",
    409: "errors.default.conflict",
    429: "errors.default.tooManyRequests",
    500: "errors.default.server",
};

export const getApiErrorMessage = (
    error: unknown,
    t: AppTranslator,
    messages: ApiErrorMessages = {}
): string => {
    if (!(error instanceof ApiError)) {
        return t("errors.unexpected");
    }

    const key = messages[error.status] ?? defaultErrorMessages[error.status];

    if (key) {
        return t(key);
    }

    // Validation (422) and unmapped statuses carry a backend-provided
    // explanation, which is shown as is.
    return error.message || t("errors.unexpected");
};
