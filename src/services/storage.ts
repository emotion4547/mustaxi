import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, RideRecord } from '@/types';

const KEYS = {
  session: 'mustaxi.session',
  history: 'mustaxi.history',
} as const;

export const storage = {
  async saveSession(session: AuthSession): Promise<void> {
    await AsyncStorage.setItem(KEYS.session, JSON.stringify(session));
  },

  async loadSession(): Promise<AuthSession | null> {
    const raw = await AsyncStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.session);
  },

  async getHistory(): Promise<RideRecord[]> {
    const raw = await AsyncStorage.getItem(KEYS.history);
    return raw ? (JSON.parse(raw) as RideRecord[]) : [];
  },

  async addHistory(record: RideRecord): Promise<void> {
    const list = await storage.getHistory();
    const next = [record, ...list].slice(0, 50);
    await AsyncStorage.setItem(KEYS.history, JSON.stringify(next));
  },
};
