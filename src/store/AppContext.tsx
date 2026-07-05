import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Locale, Translations } from '@/i18n';
import { translations, interpolate } from '@/i18n';
import { ru } from '@/i18n/locales/ru';
import type { RidePreferences, UserProfile } from '@/types';

const defaultPreferences: RidePreferences = {
  driverGender: 'any',
  noMusic: false,
  quietRide: false,
  fasting: false,
  prayerStop: false,
};

const guestProfile: UserProfile = {
  id: 'guest',
  name: 'Гость',
  phone: '',
  gender: 'male',
  preferredLocale: 'ru',
};

type Path = string; // 'order.title'

interface AppState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Переводчик по пути 'section.key' с необязательными параметрами. */
  t: (path: Path, params?: Record<string, string | number>) => string;
  preferences: RidePreferences;
  setPreferences: (p: RidePreferences) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  isAuthenticated: boolean;
  login: (phone: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppState | null>(null);

function resolve(dict: Translations, path: Path): string {
  const value = path
    .split('.')
    .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], dict);
  return typeof value === 'string' ? value : path;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>('ru');
  const [preferences, setPreferences] =
    useState<RidePreferences>(defaultPreferences);
  const [profile, setProfile] = useState<UserProfile>(guestProfile);
  const [isAuthenticated, setAuthenticated] = useState(false);

  const t = useCallback(
    (path: Path, params?: Record<string, string | number>) => {
      const dict = translations[locale] ?? ru;
      return interpolate(resolve(dict, path), params);
    },
    [locale],
  );

  const login = useCallback((phone: string) => {
    setProfile((p) => ({ ...p, phone, name: p.name || 'Пользователь' }));
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(false);
    setProfile(guestProfile);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      locale,
      setLocale,
      t,
      preferences,
      setPreferences,
      profile,
      setProfile,
      isAuthenticated,
      login,
      logout,
    }),
    [locale, t, preferences, profile, isAuthenticated, login, logout],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
