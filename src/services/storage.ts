import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, RideRecord, SavedAddress } from '@/types';

const KEYS = {
  session: 'mustaxi.session',
  history: 'mustaxi.history',
  addresses: 'mustaxi.addresses',
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

  // ── Сохранённые адреса ─────────────────────────────────────────────

  async getSavedAddresses(): Promise<SavedAddress[]> {
    const raw = await AsyncStorage.getItem(KEYS.addresses);
    return raw ? (JSON.parse(raw) as SavedAddress[]) : [];
  },

  /** Добавляет адрес; «Дом» и «Работа» — единственные (перезаписываются). */
  async saveAddress(address: SavedAddress): Promise<void> {
    const list = await storage.getSavedAddresses();
    const filtered =
      address.kind === 'custom'
        ? list.filter((a) => a.id !== address.id)
        : list.filter((a) => a.kind !== address.kind);
    const next = [address, ...filtered].slice(0, 20);
    // «Дом» и «Работа» всегда первыми, дальше — по дате добавления.
    next.sort((a, b) => {
      const rank = (k: SavedAddress['kind']) =>
        k === 'home' ? 0 : k === 'work' ? 1 : 2;
      return rank(a.kind) - rank(b.kind) || b.createdAt - a.createdAt;
    });
    await AsyncStorage.setItem(KEYS.addresses, JSON.stringify(next));
  },

  async removeAddress(id: string): Promise<void> {
    const list = await storage.getSavedAddresses();
    await AsyncStorage.setItem(
      KEYS.addresses,
      JSON.stringify(list.filter((a) => a.id !== id)),
    );
  },
};
