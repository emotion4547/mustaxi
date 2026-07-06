import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { LatLng } from '@/types';
import { computePrayerSchedule, type PrayerKey } from './prayerTimes';

/** Намазы, о которых напоминаем (без восхода — он не является молитвой). */
const NOTIFY_KEYS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const CHANNEL_ID = 'prayer-times';

// Показывать уведомление, даже если приложение открыто.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Запрашивает разрешение на уведомления; true — если выдано. */
export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Prayer times',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Планирует локальные уведомления о намазах на ближайшие двое суток
 * (только будущие времена). Возвращает число запланированных.
 * Перед планированием отменяет прежние, чтобы не дублировать.
 */
export async function schedulePrayerNotifications(
  point: LatLng,
  labels: Record<PrayerKey, string>,
  body: string,
): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = new Date();
  const days = [now, new Date(now.getTime() + 24 * 60 * 60 * 1000)];
  let count = 0;
  for (const day of days) {
    const schedule = computePrayerSchedule(point, day);
    for (const key of NOTIFY_KEYS) {
      const at = schedule.times[key];
      if (at.getTime() <= now.getTime()) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🕌 ${labels[key]}`,
          body,
          sound: 'default',
        },
        trigger: { date: at, channelId: CHANNEL_ID },
      });
      count += 1;
    }
  }
  return count;
}

export async function cancelPrayerNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
