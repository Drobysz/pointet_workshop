export interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

export type ValidationErrors = Record<
    string,
    string[]
>;

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly errors?: ValidationErrors,
    ) {
        super(message);
    }

    public isUnauthorized(): boolean {
        return this.status === 401;
    }

    public isForbidden(): boolean {
        return this.status === 403;
    }

    public isValidationError(): boolean {
        return this.status === 422;
    }

    public areTooManyRequests(): boolean {
        return this.status === 429;
    }
}
