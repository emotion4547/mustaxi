import type { CarClass, FareEstimate, LatLng } from '@/types';

const BASE_FARE = 120; // подача
const PER_KM = 28;
const CURRENCY = '₽';

/** Описание тарифного класса авто. */
export interface CarClassInfo {
  id: CarClass;
  /** Множитель к километровой части тарифа. */
  multiplier: number;
  /** Надбавка к подаче. */
  baseExtra: number;
  glyph: string;
}

/** Классы авто и их коэффициенты (прозрачный тариф, без скрытых надбавок). */
export const CAR_CLASSES: CarClassInfo[] = [
  { id: 'econom', multiplier: 1, baseExtra: 0, glyph: '🚗' },
  { id: 'comfort', multiplier: 1.25, baseExtra: 40, glyph: '🚙' },
  { id: 'minivan', multiplier: 1.5, baseExtra: 80, glyph: '🚐' },
];

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Расстояние по большой окружности (формула гаверсинусов), км. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Расчёт стоимости поездки.
 * Принципиально без ссудного процента (риба): фиксированная подача +
 * прозрачная ставка за километр. Никаких скрытых надбавок и рассрочек
 * под процент. Чаевые водителю — добровольны и считаются отдельно.
 */
export function estimateFare(
  pickup: LatLng,
  destination: LatLng,
  carClass: CarClass = 'econom',
): FareEstimate {
  return estimateFareForDistance(haversineKm(pickup, destination), carClass);
}

/**
 * Тариф от известного расстояния (например, реального маршрута из
 * Yandex Routing) — та же прозрачная формула без риба.
 */
export function estimateFareForDistance(
  rawDistanceKm: number,
  carClass: CarClass = 'econom',
): FareEstimate {
  const info =
    CAR_CLASSES.find((c) => c.id === carClass) ?? CAR_CLASSES[0];
  const distanceKm = Math.max(0.1, rawDistanceKm);
  const base = BASE_FARE + info.baseExtra;
  const distanceFare = Math.round(distanceKm * PER_KM * info.multiplier);
  const total = base + distanceFare;
  return {
    base,
    distanceKm: Math.round(distanceKm * 10) / 10,
    distanceFare,
    total,
    currency: CURRENCY,
    carClass: info.id,
    ribaFree: true,
  };
}

export function formatPrice(amount: number, currency = CURRENCY): string {
  return `${amount} ${currency}`;
}
