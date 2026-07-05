// Динамическая конфигурация Expo.
//
// Ключи Яндекса берутся из окружения (в CI — из GitHub-секретов) и НЕ
// хранятся в репозитории. Если ключа Карт нет — карта откатывается на
// бесплатные тайлы OpenStreetMap/CARTO (Leaflet). Если нет ключа Геокодера —
// поиск адреса откатывается на Nominatim (OSM).
const yandexMapsKey = process.env.YANDEX_MAPS_API_KEY || '';
const yandexGeocoderKey = process.env.YANDEX_GEOCODER_API_KEY || '';

module.exports = {
  expo: {
    name: 'MusTaxi',
    slug: 'mustaxi',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    scheme: 'mustaxi',
    owner: 'em0t1on',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mustaxi.app',
      icon: './assets/icon.png',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'MusTaxi использует геолокацию для подачи такси, расчёта времени намаза и определения направления Киблы.',
      },
    },
    android: {
      package: 'com.mustaxi.app',
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-location'],
    extra: {
      supportedLocales: ['ru', 'ar', 'en'],
      yandex: {
        mapsKey: yandexMapsKey,
        geocoderKey: yandexGeocoderKey,
      },
      eas: {
        projectId: '200a1e9d-10c2-4c54-a7f7-6bf5efc3ca4f',
      },
    },
  },
};
