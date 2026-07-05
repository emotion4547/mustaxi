import Constants from 'expo-constants';
import type { LatLng, Place } from '@/types';

const YANDEX_KEY: string =
  Constants.expoConfig?.extra?.yandex?.geocoderKey ?? '';

// ── Яндекс.Геокодер ────────────────────────────────────────────────────

interface YandexFeature {
  GeoObject: {
    name?: string;
    description?: string;
    Point: { pos: string }; // "lng lat"
  };
}

function parseYandex(json: unknown): Place[] {
  const members =
    (json as any)?.response?.GeoObjectCollection?.featureMember ?? [];
  return (members as YandexFeature[]).map((m, i) => {
    const g = m.GeoObject;
    const [lng, lat] = g.Point.pos.split(' ').map(Number);
    return {
      id: `ya-${i}-${g.Point.pos}`,
      title: g.name || g.description || 'Адрес',
      subtitle: g.description || '',
      location: { latitude: lat, longitude: lng },
    };
  });
}

async function yandexSearch(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const url =
    `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_KEY}` +
    `&format=json&lang=ru_RU&results=6&geocode=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`yandex geocode ${res.status}`);
  return parseYandex(await res.json());
}

async function yandexReverse(point: LatLng): Promise<string | null> {
  const url =
    `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_KEY}` +
    `&format=json&lang=ru_RU&results=1&kind=house` +
    `&geocode=${point.longitude},${point.latitude}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const places = parseYandex(await res.json());
  return places[0]?.title ?? null;
}

// ── Nominatim (OSM) — запасной вариант без ключа ────────────────────────

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = {
  'User-Agent': 'MusTaxi/0.1 (prototype; contact: support@mustaxi.app)',
  'Accept-Language': 'ru',
};

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
}

async function nominatimSearch(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const url =
    `${NOMINATIM}/search?format=jsonv2&limit=6&accept-language=ru` +
    `&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: NOMINATIM_HEADERS, signal });
  if (!res.ok) throw new Error(`nominatim ${res.status}`);
  const items = (await res.json()) as NominatimItem[];
  return items.map((item) => {
    const parts = item.display_name.split(',').map((s) => s.trim());
    return {
      id: `osm-${item.place_id}`,
      title: item.name || parts[0] || item.display_name,
      subtitle: parts.slice(item.name ? 0 : 1).join(', '),
      location: { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) },
    };
  });
}

async function nominatimReverse(point: LatLng): Promise<string | null> {
  const url =
    `${NOMINATIM}/reverse?format=jsonv2&accept-language=ru` +
    `&lat=${point.latitude}&lon=${point.longitude}`;
  try {
    const res = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return null;
    const item = (await res.json()) as NominatimItem;
    return item.name || item.display_name?.split(',').slice(0, 2).join(', ') || null;
  } catch {
    return null;
  }
}

// ── Публичный API ──────────────────────────────────────────────────────

/** Поиск мест по тексту (Яндекс при наличии ключа, иначе Nominatim). */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  if (query.trim().length < 3) return [];
  if (YANDEX_KEY) {
    try {
      return await yandexSearch(query, signal);
    } catch {
      // при сбое Яндекса пробуем бесплатный OSM
    }
  }
  return nominatimSearch(query, signal);
}

/** Координаты → адрес. */
export async function reverseGeocode(point: LatLng): Promise<string | null> {
  if (YANDEX_KEY) {
    try {
      const name = await yandexReverse(point);
      if (name) return name;
    } catch {
      // откат ниже
    }
  }
  return nominatimReverse(point);
}
