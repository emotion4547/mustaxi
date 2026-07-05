import { ru, type Translations } from './locales/ru';
import { en } from './locales/en';
import { ar } from './locales/ar';

export type { Translations };

export type Locale = 'ru' | 'ar' | 'en';

export const translations: Record<Locale, Translations> = { ru, en, ar };

/** Языки с письмом справа налево. */
export const rtlLocales: Locale[] = ['ar'];

export const isRTL = (locale: Locale): boolean => rtlLocales.includes(locale);

/**
 * Подставляет параметры вида {name} в строку перевода.
 * interpolate('за {price}', { price: '350 ₽' }) -> 'за 350 ₽'
 */
export const interpolate = (
  template: string,
  params?: Record<string, string | number>,
): string => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
};
