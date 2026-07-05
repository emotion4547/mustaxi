import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  type Region,
} from 'react-native-maps';
import Constants from 'expo-constants';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { LatLng } from '@/types';

interface Props {
  pickup: LatLng;
  destination?: LatLng | null;
  driver?: LatLng | null;
  /** Подпись к маркеру водителя (имя). */
  driverLabel?: string;
  style?: object;
}

/**
 * Доступна ли нативная карта. На iOS используется Apple Maps (ключ не нужен).
 * На Android нужен ключ Google Maps — без него react-native-maps может
 * уронить приложение при инициализации, поэтому карту не рендерим.
 */
const mapsAvailable =
  Platform.OS !== 'android' ||
  !!Constants.expoConfig?.extra?.hasMapsKey;

/** Запасной вид, когда нативная карта недоступна (нет ключа Google Maps). */
const MapFallback: React.FC<{ style?: object }> = ({ style }) => (
  <View style={[styles.wrap, styles.fallback, style]}>
    <Text style={styles.fallbackIcon}>🗺️</Text>
    <Text style={styles.fallbackTitle}>Карта недоступна</Text>
    <Text style={styles.fallbackText}>
      Добавьте ключ Google Maps (GOOGLE_MAPS_API_KEY), чтобы включить карту
    </Text>
  </View>
);

/** Регион, охватывающий все переданные точки, с отступом. */
function regionFor(points: LatLng[]): Region {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latDelta = Math.max((maxLat - minLat) * 1.6, 0.02);
  const lngDelta = Math.max((maxLng - minLng) * 1.6, 0.02);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

/**
 * Карта с маркерами подачи, назначения и водителя.
 * Автоматически подстраивает область, чтобы все точки были видны.
 */
export const AppMap: React.FC<Props> = ({
  pickup,
  destination,
  driver,
  driverLabel,
  style,
}) => {
  const mapRef = useRef<MapView>(null);

  const points = [pickup, destination, driver].filter(
    (p): p is LatLng => !!p,
  );

  // Без ключа Google Maps на Android показываем заглушку, а не нативную
  // карту — иначе приложение может аварийно завершиться.
  if (!mapsAvailable) {
    return <MapFallback style={style} />;
  }

  useEffect(() => {
    if (points.length < 2 || !mapRef.current) return;
    mapRef.current.fitToCoordinates(points, {
      edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
      animated: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickup.latitude,
    pickup.longitude,
    destination?.latitude,
    destination?.longitude,
    driver?.latitude,
    driver?.longitude,
  ]);

  return (
    <View style={[styles.wrap, style]}>
      <MapView
        ref={mapRef}
        // Android всегда использует Google Maps; на iOS оставляем Apple Maps.
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFill}
        initialRegion={regionFor(points.length ? points : [pickup])}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Marker coordinate={pickup} title="Откуда" pinColor={colors.success} />
        {destination && (
          <Marker
            coordinate={destination}
            title="Куда"
            pinColor={colors.danger}
          />
        )}
        {driver && (
          <Marker coordinate={driver} title={driverLabel ?? 'Водитель'}>
            <View style={styles.carMarker} />
          </Marker>
        )}
        {destination && (
          <Polyline
            coordinates={[driver ?? pickup, destination]}
            strokeColor={colors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  carMarker: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fallbackIcon: { fontSize: 44, marginBottom: spacing.sm },
  fallbackTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  fallbackText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
