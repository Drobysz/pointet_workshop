import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import type {Messages} from 'next-intl';
import {routing} from './routing';

type MessageTree = { [key: string]: string | MessageTree };

/** Fills the keys missing from `messages` with the default-locale wording. */
function withFallback(messages: MessageTree, fallback: MessageTree): MessageTree {
  const result: MessageTree = { ...fallback };

  for (const [key, value] of Object.entries(messages)) {
    const fallbackValue = fallback[key];

    result[key] = typeof value === 'object' && typeof fallbackValue === 'object'
      ? withFallback(value, fallbackValue)
      : value;
  }

  return result;
}

async function loadMessages(locale: string): Promise<MessageTree> {
  return (await import(`../messages/${locale}.json`)).default;
}

export default getRequestConfig(async ({ locale, requestLocale }) => {
  // An explicit `locale` (e.g. `getTranslations({locale})`) wins over the
  // `[locale]` segment of the current request.
  const requested = locale ?? await requestLocale;
  const currentLocale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = await loadMessages(currentLocale);

  return {
    locale: currentLocale,
    // A key that is not translated yet falls back to the default language
    // instead of surfacing the raw key in the interface.
    messages: (currentLocale === routing.defaultLocale
      ? messages
      : withFallback(messages, await loadMessages(routing.defaultLocale))
    ) as Messages,
  };
});
