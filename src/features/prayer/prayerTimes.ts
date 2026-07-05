import {
  CalculationMethod,
  Coordinates,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from 'adhan';
import type { LatLng } from '@/types';

export type PrayerKey =
  | 'fajr'
  | 'sunrise'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha';

export interface PrayerSchedule {
  times: Record<PrayerKey, Date>;
  /** Ключ ближайшего предстоящего намаза. */
  next: PrayerKey;
  nextAt: Date;
  qiblaDegrees: number;
}

/**
 * Рассчитывает расписание намаза на текущий день по координатам.
 * Метод расчёта — Muslim World League (можно вынести в настройки).
 */
export function computePrayerSchedule(
  point: LatLng,
  date: Date = new Date(),
): PrayerSchedule {
  const coordinates = new Coordinates(point.latitude, point.longitude);
  const params = CalculationMethod.MuslimWorldLeague();
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const sunnah = new SunnahTimes(prayerTimes);

  const times: Record<PrayerKey, Date> = {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  };

  // Определяем ближайший предстоящий намаз.
  const order: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const now = date.getTime();
  let next: PrayerKey = 'fajr';
  let nextAt = times.fajr;
  const upcoming = order.find((k) => times[k].getTime() > now);
  if (upcoming) {
    next = upcoming;
    nextAt = times[upcoming];
  } else {
    // Все намазы прошли — следующий Фаджр завтра.
    next = 'fajr';
    nextAt = sunnah.middleOfTheNight; // приблизительно; будет уточнён следующим днём
  }

  const qiblaDegrees = Qibla(coordinates);

  return { times, next, nextAt, qiblaDegrees };
}

/** Форматирует время намаза как ЧЧ:ММ по локали устройства. */
export function formatPrayerTime(date: Date, locale = 'ru'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
