import type { LatLng } from '@/types';

/** Координаты Каабы (Мекка). */
export const KAABA: LatLng = { latitude: 21.4225, longitude: 39.8262 };

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Азимут направления на Каабу от текущей точки (в градусах от севера,
 * по часовой стрелке). Резервная реализация на случай, если не хочется
 * тянуть adhan только ради Киблы.
 */
export function qiblaBearing(from: LatLng): number {
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(KAABA.latitude);
  const dLng = toRad(KAABA.longitude - from.longitude);

  const y = Math.sin(dLng);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}
