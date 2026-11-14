import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  locales: ['en', 'fr', 'de', 'it', 'ru', 'uk'],
  defaultLocale: 'en'
});

export type AppLocale = (typeof routing.locales)[number];

/** Each language in its own name, as shown by the language switchers. */
export const localeNames: Record<AppLocale, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ru: 'Русский',
  uk: 'Українська',
};
