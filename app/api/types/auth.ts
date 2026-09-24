// ============================================================
// Authentication
// ============================================================

import { ApiResponse, Id, Language } from "./api";
import { User } from "./user";

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    address: string;

    tel?: string | null;
    language?: Language;
    refer_id?: Id | null;
}

export interface RegistrationPending {
    status: "pending";

    /**
     * Only returned in local environment
     * when verification email was sent.
     */
    verification_url?: string;
}

export interface VerifyRequest {
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    /**
     * Optional fallback.
     * Normally refresh_token comes from HttpOnly cookie.
     */
    refresh_token?: string;
}

export interface SessionData {
    user: User;
    authenticated: true;
}

export type SessionResponse = ApiResponse<SessionData>;

export interface AuthenticatedData {
    authenticated: true;
}

export type AuthenticatedResponse =
    ApiResponse<AuthenticatedData>;

export interface LoggedOutData {
    logged_out: true;
}

export type LoggedOutResponse =
    ApiResponse<LoggedOutData>;
