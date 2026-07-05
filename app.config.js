// Динамическая конфигурация Expo.
//
// Ключ Google Maps берётся из переменной окружения GOOGLE_MAPS_API_KEY
// (в CI — из GitHub-секрета), поэтому НЕ хранится в репозитории. Если ключ
// не задан, блок googleMaps не добавляется — приложение собирается, но
// карта на Android будет пустой.
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

const androidConfig = googleMapsApiKey
  ? { config: { googleMaps: { apiKey: googleMapsApiKey } } }
  : {};

const iosConfig = googleMapsApiKey ? { config: { googleMapsApiKey } } : {};

module.exports = {
  expo: {
    name: 'MusTaxi',
    slug: 'mustaxi',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    scheme: 'mustaxi',
    owner: 'em0t1on',
    splash: {
      resizeMode: 'contain',
      backgroundColor: '#0A6B4E',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.mustaxi.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'MusTaxi использует геолокацию для подачи такси, расчёта времени намаза и определения направления Киблы.',
      },
      ...iosConfig,
    },
    android: {
      package: 'com.mustaxi.app',
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
      ...androidConfig,
    },
    plugins: ['expo-location'],
    extra: {
      supportedLocales: ['ru', 'ar', 'en'],
      eas: {
        projectId: '200a1e9d-10c2-4c54-a7f7-6bf5efc3ca4f',
      },
    },
  },
};
