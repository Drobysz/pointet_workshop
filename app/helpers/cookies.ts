import { language } from "@/types/auth";

export class CookiesClient {
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
        maxAge: number,
    ) {
        document.cookie = [
            `${name}=${encodeURIComponent(value)}`,
            "path=/",
            maxAge ? `max-age=${maxAge}` : "",
            "samesite=lax",
        ]
            .filter(Boolean)
            .join("; ");
    }

    public getLocale(): language {
        return this.getCookies("NEXT_LOCALE") as language;
    }
}
