import type { LatLng, Place } from '@/types';
import { haversineKm } from '@/features/payment/fare';

/**
 * Поиск ближайших мечетей.
 * Основной источник — Overpass API (OpenStreetMap): бесплатно, без ключей.
 * При сбое сети — статический список известных мечетей, отфильтрованный
 * по расстоянию до пользователя.
 */
const OVERPASS = 'https://overpass-api.de/api/interpreter';

const STATIC_MOSQUES: Place[] = [
  {
    id: 'm-msk-cathedral',
    title: 'Московская Соборная мечеть',
    subtitle: 'Москва, Выползов пер., 7',
    location: { latitude: 55.7797, longitude: 37.6314 },
  },
  {
    id: 'm-msk-historic',
    title: 'Историческая мечеть',
    subtitle: 'Москва, Б. Татарская ул., 28',
    location: { latitude: 55.7392, longitude: 37.6296 },
  },
  {
    id: 'm-spb-cathedral',
    title: 'Санкт-Петербургская Соборная мечеть',
    subtitle: 'СПб, Кронверкский пр., 7',
    location: { latitude: 59.9553, longitude: 30.3238 },
  },
  {
    id: 'm-kzn-kulsharif',
    title: 'Мечеть Кул-Шариф',
    subtitle: 'Казань, Кремль',
    location: { latitude: 55.7983, longitude: 49.1051 },
  },
  {
    id: 'm-orb-central',
    title: 'Центральная мечеть',
    subtitle: 'Оренбург, ул. Терешковой, 10А',
    location: { latitude: 51.7793, longitude: 55.1187 },
  },
  {
    id: 'm-ufa-lala',
    title: 'Мечеть Ляля-Тюльпан',
    subtitle: 'Уфа, ул. Комарова, 5',
    location: { latitude: 54.8095, longitude: 56.0902 },
  },
];

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string };
}

export async function fetchNearbyMosques(
  center: LatLng,
  radiusKm = 7,
  fallbackTitle = 'Мечеть',
): Promise<Place[]> {
  try {
    const query =
      `[out:json][timeout:8];` +
      `nwr["amenity"="place_of_worship"]["religion"="muslim"]` +
      `(around:${Math.round(radiusKm * 1000)},${center.latitude},${center.longitude});` +
      `out center 30;`;
    const res = await fetch(OVERPASS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) throw new Error(`overpass ${res.status}`);
    const json = (await res.json()) as { elements?: OverpassElement[] };
    const places: Place[] = (json.elements ?? [])
      .map((e) => {
        const lat = e.lat ?? e.center?.lat;
        const lon = e.lon ?? e.center?.lon;
        if (lat == null || lon == null) return null;
        return {
          id: `osm-mosque-${e.id}`,
          title: e.tags?.name ?? fallbackTitle,
          location: { latitude: lat, longitude: lon },
        };
      })
      .filter((p): p is Place => p !== null);
    return places;
  } catch {
    // Офлайн/сбой: показываем известные мечети в разумном радиусе.
    return STATIC_MOSQUES.filter(
      (m) => haversineKm(center, m.location) <= radiusKm * 3,
    );
  }
}
