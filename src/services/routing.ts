import Constants from 'expo-constants';
import type { LatLng } from '@/types';
import { haversineKm } from '@/features/payment/fare';

const ROUTING_KEY: string =
  Constants.expoConfig?.extra?.yandex?.routingKey ?? '';

/** Средняя городская скорость для оценки времени без Routing API. */
const AVG_SPEED_KMH = 25;

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  /** Геометрия маршрута (при откате — прямая из двух точек). */
  polyline: LatLng[];
  /** true — реальный маршрут от Яндекса; false — оценка по прямой. */
  precise: boolean;
}

/** Оценка по прямой (гаверсинус): работает всегда, без ключей и сети. */
function fallbackRoute(from: LatLng, to: LatLng): RouteInfo {
  const distanceKm = Math.max(0.1, haversineKm(from, to));
  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin: Math.max(1, Math.round((distanceKm / AVG_SPEED_KMH) * 60)),
    polyline: [from, to],
    precise: false,
  };
}

/**
 * Маршрут через Yandex Routing API (v2/route). Ответ разбираем «щадяще»:
 * суммируем длину/время по шагам и собираем геометрию; при любой
 * неожиданности в формате бросаем — вызывающий откатится на прямую.
 */
async function yandexRoute(from: LatLng, to: LatLng): Promise<RouteInfo> {
  const url =
    `https://api.routing.yandex.net/v2/route?apikey=${ROUTING_KEY}` +
    `&waypoints=${from.latitude},${from.longitude}|${to.latitude},${to.longitude}` +
    `&mode=driving`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`routing ${res.status}`);
  const json = (await res.json()) as any;

  const legs = json?.route?.legs ?? [];
  let meters = 0;
  let seconds = 0;
  const polyline: LatLng[] = [];
  for (const leg of legs) {
    for (const step of leg?.steps ?? []) {
      meters += Number(step?.length?.value ?? step?.length ?? 0) || 0;
      seconds += Number(step?.duration?.value ?? step?.duration ?? 0) || 0;
      const pts = step?.polyline?.points ?? [];
      for (const p of pts) {
        if (Array.isArray(p) && p.length >= 2) {
          polyline.push({ latitude: Number(p[0]), longitude: Number(p[1]) });
        }
      }
    }
  }
  if (!meters || polyline.length < 2) throw new Error('routing: empty route');
  return {
    distanceKm: Math.round(meters / 100) / 10,
    durationMin: Math.max(1, Math.round(seconds / 60)),
    polyline,
    precise: true,
  };
}

/**
 * Расстояние, время и геометрия маршрута. С ключом — реальный маршрут
 * Яндекса; без ключа или при сбое — оценка по прямой.
 */
export async function getRoute(from: LatLng, to: LatLng): Promise<RouteInfo> {
  if (ROUTING_KEY) {
    try {
      return await yandexRoute(from, to);
    } catch {
      // откат ниже
    }
  }
  return fallbackRoute(from, to);
}
