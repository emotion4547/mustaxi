import type { LatLng, Place } from '@/types';

/**
 * Геокодирование через Nominatim (OpenStreetMap).
 * Бесплатно, без ключей и регистрации. По правилам использования —
 * не более ~1 запроса в секунду и обязательный User-Agent.
 */
const BASE = 'https://nominatim.openstreetmap.org';
const HEADERS = {
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

/** Делит длинную строку адреса на заголовок и подпись. */
function splitTitle(item: NominatimItem): { title: string; subtitle: string } {
  const parts = item.display_name.split(',').map((s) => s.trim());
  const title = item.name || parts[0] || item.display_name;
  const subtitle = parts.slice(item.name ? 0 : 1).join(', ');
  return { title, subtitle };
}

/** Поиск мест по текстовому запросу. */
export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url =
    `${BASE}/search?format=jsonv2&addressdetails=0&limit=6` +
    `&accept-language=ru&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: HEADERS, signal });
  if (!res.ok) throw new Error(`geocode ${res.status}`);
  const items = (await res.json()) as NominatimItem[];
  return items.map((item) => {
    const { title, subtitle } = splitTitle(item);
    return {
      id: `osm-${item.place_id}`,
      title,
      subtitle,
      location: {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      },
    };
  });
}

/** Обратное геокодирование: координаты → человекочитаемый адрес. */
export async function reverseGeocode(point: LatLng): Promise<string | null> {
  const url =
    `${BASE}/reverse?format=jsonv2&accept-language=ru` +
    `&lat=${point.latitude}&lon=${point.longitude}`;
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const item = (await res.json()) as NominatimItem;
    return item.name || item.display_name?.split(',').slice(0, 2).join(', ') || null;
  } catch {
    return null;
  }
}
