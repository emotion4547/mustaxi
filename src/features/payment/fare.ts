import type { FareEstimate, LatLng } from '@/types';

const BASE_FARE = 120; // подача
const PER_KM = 28;
const CURRENCY = '₽';

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
export function estimateFare(pickup: LatLng, destination: LatLng): FareEstimate {
  const distanceKm = Math.max(0.1, haversineKm(pickup, destination));
  const distanceFare = Math.round(distanceKm * PER_KM);
  const total = BASE_FARE + distanceFare;
  return {
    base: BASE_FARE,
    distanceKm: Math.round(distanceKm * 10) / 10,
    distanceFare,
    total,
    currency: CURRENCY,
    ribaFree: true,
  };
}

export function formatPrice(amount: number, currency = CURRENCY): string {
  return `${amount} ${currency}`;
}
