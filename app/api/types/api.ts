// ============================================================
// Common
// ============================================================

export type Id = number;

export type Language =
    | "en"
    | "it"
    | "fr"
    | "ru"
    | "de"
    | "uk";

export type UserRole =
    | "user"
    | "admin";

export interface ApiResponse<T> {
    data: T;
}

export interface ApiError {
    error: {
        code: string;
        message: string;
    };
}

export interface ValidationError {
    message: string;
    errors: Record<string, string[]>;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginationMetaLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationMetaLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}

export interface PaginationParams {
    page?: number;
    per_page?: number;
}

export interface SearchQueryParams {
    search?: string;
}
