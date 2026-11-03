import { language } from "@/types/auth";

export class CookiesService {
    public getCookies(name: string): string | null {
        const value = document.cookie
            .split("; ")
            .find(row => row.startsWith(`${name}=`));

        return value 
            ? decodeURIComponent(value.split("=")[1])
            : null;
    }

    public setCookies(
        name: string,
        value: string,
        days: number,
    ) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        document.cookie = [
            `${name}=${encodeURIComponent(value)}`,
            "path=/",
            `expires=${date.toUTCString()}`,
            "samesite=lax",
        ]
            .filter(Boolean)
            .join("; ");
    }

    public deleteCookie(
        name: string,
    ) {
        document.cookie = [
            `${name}=`,
            "path=/",
            "expires=Thu, 01 Jan 1970 00:00:00 UTC",
            "samesite=lax",
        ]
            .filter(Boolean)
            .join("; ");
    }

    public setJSONCookie<T>(
        name: string, 
        data: T,
        days: number
    ) {
        const jsonData = JSON.stringify(data);
        this.setCookies(name, jsonData, days);
    }

    public getJSONCookie<T>(name: string): T | null {
        const cookieValue = this.getCookies(name);
        if (!cookieValue) {
            return null;
        }

        try {
            return JSON.parse(cookieValue);
        } catch {
            return null;
        }
    }

    public getLocale(): language {
        return this.getCookies("NEXT_LOCALE") as language;
    }
}
