import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Locale, Translations } from '@/i18n';
import { translations, interpolate } from '@/i18n';
import { ru } from '@/i18n/locales/ru';
import type { RidePreferences, UserProfile } from '@/types';
import { storage } from '@/services/storage';
import { requestOtp, verifyOtp } from '@/services/api';

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
  bootstrapping: boolean;
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Переводчик по пути 'section.key' с необязательными параметрами. */
  t: (path: Path, params?: Record<string, string | number>) => string;
  preferences: RidePreferences;
  setPreferences: (p: RidePreferences) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  isAuthenticated: boolean;
  /** Запросить SMS-код. Возвращает демо-код (в проде — void). */
  sendOtp: (phone: string) => Promise<string>;
  /** Проверить код и войти. Бросает при неверном коде. */
  confirmOtp: (phone: string, code: string) => Promise<void>;
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
  const [bootstrapping, setBootstrapping] = useState(true);
  const [locale, setLocale] = useState<Locale>('ru');
  const [preferences, setPreferences] =
    useState<RidePreferences>(defaultPreferences);
  const [profile, setProfile] = useState<UserProfile>(guestProfile);
  const [isAuthenticated, setAuthenticated] = useState(false);

  // Восстановление сессии при запуске.
  useEffect(() => {
    (async () => {
      try {
        const session = await storage.loadSession();
        if (session) {
          setProfile(session.profile);
          setLocale(session.profile.preferredLocale);
          setAuthenticated(true);
        }
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const t = useCallback(
    (path: Path, params?: Record<string, string | number>) => {
      const dict = translations[locale] ?? ru;
      return interpolate(resolve(dict, path), params);
    },
    [locale],
  );

  const sendOtp = useCallback(async (phone: string) => {
    const challenge = await requestOtp(phone);
    return challenge.demoCode;
  }, []);

  const confirmOtp = useCallback(
    async (phone: string, code: string) => {
      const { token, profile: p } = await verifyOtp(phone, code);
      const withLocale = { ...p, preferredLocale: locale };
      await storage.saveSession({ token, profile: withLocale });
      setProfile(withLocale);
      setAuthenticated(true);
    },
    [locale],
  );

  const logout = useCallback(async () => {
    await storage.clearSession();
    setAuthenticated(false);
    setProfile(guestProfile);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      bootstrapping,
      locale,
      setLocale,
      t,
      preferences,
      setPreferences,
      profile,
      setProfile,
      isAuthenticated,
      sendOtp,
      confirmOtp,
      logout,
    }),
    [
      bootstrapping,
      locale,
      t,
      preferences,
      profile,
      isAuthenticated,
      sendOtp,
      confirmOtp,
      logout,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
