import type messages from "./messages/en.json";
import type { routing } from "./i18n/routing";

// Makes translation keys, their arguments and locales type-safe:
// a key that is missing from `messages/en.json` fails the type check.
declare module "next-intl" {
    interface AppConfig {
        Locale: (typeof routing.locales)[number];
        Messages: typeof messages;
    }
}
