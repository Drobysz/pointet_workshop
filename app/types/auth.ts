export type language = "ru" | "en" | "it" | "de" | "fr" | "uk";

export type LoginForm = {
    email: string;
    password: string;
}

export type RegisterForm = {
    email: string;
    full_name: string;
    address?: string;
    password: string;
}
