import { ApiError } from "./ApiError";

export type ApiErrorMessages = Record<number, string>;

export const getApiErrorMessage = (
    error: unknown,
    messages: ApiErrorMessages = {}
): string => {
    if (!(error instanceof ApiError)) {
        return "An unexpected error occurred.";
    }

    const customMessage = messages[error.status];

    if (customMessage) 
        return customMessage;

    switch (error.status) {
        case 400:
            return "The request could not be processed.";

        case 401:
            return "Your session has expired. Please sign in again.";

        case 403:
            return "You do not have permission to perform this action.";

        case 404:
            return "The requested resource was not found.";

        case 409:
            return "The request conflicts with the current state.";

        case 422:
            return error.message;

        case 429:
            return "Too many requests. Please try again later.";

        case 500:
            return "A server error occurred. Please try again later.";

        default:
            return error.message;
    }
};
