// ============================================================
// User
// ============================================================

import {
    ApiResponse,
    Id,
    Language,
    UserRole
} from "./api";

export interface User {
    id: Id;
    email: string;
    full_name: string;
    address?: string;
    tel?: string | null;
    language: Language;
    role: UserRole;
    orders_count: number;
    basket_goods_count: number;
    email_verified_at?: string | null;
    created_at?: string | null;
}

export interface UserUpdateRequest {
    email?: string;
    full_name?: string;
    address?: string;
    tel?: string | null;
    language?: Language;
    password?: string;
}

export type UserResponse = ApiResponse<User>;

export interface EmailChangeRequest {
    email: string;
}

export interface EmailChangePendingResponse {
    data: {
        status: "pending_verification";
    };
}

export interface EmailChangeVerificationRequest {
    code: string; // exactly 6 digits
}

export type EmailChangeVerificationResponse = ApiResponse<User>;

export interface PasswordChangeRequest {
    current_password: string;
    new_password: string;
}

export type PasswordChangeResponse = ApiResponse<User>;
