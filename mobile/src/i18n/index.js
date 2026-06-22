import en from './messages/en.json';
import uk from './messages/uk.json';

export const SUPPORTED_LOCALES = ['en', 'uk'];
export const DEFAULT_LOCALE = 'en';

export const messages = { en, uk };

export function normalizeLocale(raw) {
  // Accepts full BCP-47 tags (e.g. "uk-UA") and falls back to the default.
  const short = (raw || '').toLowerCase().split('-')[0];
  return SUPPORTED_LOCALES.includes(short) ? short : DEFAULT_LOCALE;
}
