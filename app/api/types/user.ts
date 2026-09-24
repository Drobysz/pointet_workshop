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
    address: string;
    tel: string | null;
    language: Language;
    avatar_url: string | null;
    role: UserRole;
    email_verified_at: string | null;
    created_at: string | null;
}

export interface UserUpdateRequest {
    email?: string;
    full_name?: string;
    address?: string;
    tel?: string | null;
    language?: Language;
    avatar_url?: string | null;
    password?: string;
}

export type UserResponse = ApiResponse<User>;
