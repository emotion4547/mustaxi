/**
 * Цветовая палитра MusTaxi.
 * Основа — исламский зелёный с золотыми акцентами.
 */
export const colors = {
  primary: '#0A6B4E', // насыщенный зелёный
  primaryDark: '#074E39',
  primaryLight: '#E6F2ED',
  accent: '#C9A227', // золото
  accentDark: '#A9861B',

  background: '#FFFFFF',
  surface: '#F6F8F7',
  surfaceAlt: '#EDF2F0',

  text: '#1A1D1B',
  textMuted: '#6B7770',
  textInverse: '#FFFFFF',

  border: '#DDE4E1',

  success: '#2E9E5B',
  warning: '#E0A400',
  danger: '#D24B4B',

  // Специфичные для функций
  prayer: '#0A6B4E',
  qibla: '#C9A227',
  female: '#B5548C',
  male: '#3E77B5',
} as const;

export type AppColors = typeof colors;
