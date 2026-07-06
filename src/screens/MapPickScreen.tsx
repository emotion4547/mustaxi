import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppMap } from '@/components/AppMap';
import { Button } from '@/components/Button';
import { useApp } from '@/store/AppContext';
import { useCurrentLocation } from '@/features/location/useCurrentLocation';
import { reverseGeocode } from '@/services/geocoding';
import { colors, fontSize, radius, spacing } from '@/theme';
import type { LatLng, Place } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MapPick'>;

/**
 * Выбор точки перетаскиванием карты: пин зафиксирован в центре экрана,
 * адрес под ним определяется обратным геокодированием.
 */
export const MapPickScreen: React.FC<Props> = ({ navigation, route }) => {
  const { target } = route.params;
  const { t, pickup, setPickup, setDestination } = useApp();
  const { location } = useCurrentLocation();

  const initial = pickup?.location ?? location;
  const [center, setCenter] = useState<LatLng>(initial);
  const [address, setAddress] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Адрес центра — с debounce, чтобы не дёргать геокодер на каждый пиксель.
  useEffect(() => {
    setResolving(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const name = await reverseGeocode(center);
        setAddress(name);
      } catch {
        setAddress(null);
      } finally {
        setResolving(false);
      }
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [center]);

  const confirm = () => {
    const place: Place = {
      id: `map-${Date.now()}`,
      title: address ?? t('mapPick.point'),
      location: center,
    };
    if (target === 'pickup') setPickup(place);
    else setDestination(place);
    navigation.popToTop();
  };

  return (
    <View style={styles.root}>
      <AppMap
        pickup={initial}
        pickMode
        onCenter={setCenter}
        showLocate={false}
        offlineNotice={t('map.offline')}
        style={styles.map}
      />

      {/* Пин, зафиксированный в центре экрана (кончик — в центре карты) */}
      <View style={styles.pinWrap} pointerEvents="none">
        <Text style={styles.pin}>📍</Text>
      </View>

      {/* Шапка */}
      <SafeAreaView edges={['top']} style={styles.header} pointerEvents="box-none">
        <View style={styles.headerRow} pointerEvents="box-none">
          <Pressable style={styles.close} onPress={() => navigation.goBack()}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
          <View style={styles.addressCard}>
            <Text style={styles.addressLabel}>
              {target === 'pickup' ? t('home.from') : t('home.to')}
            </Text>
            {resolving ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.addressValue} numberOfLines={1}>
                {address ?? t('mapPick.point')}
              </Text>
            )}
          </View>
          <View style={styles.close} />
        </View>
      </SafeAreaView>

      {/* Кнопка подтверждения */}
      <SafeAreaView edges={['bottom']} style={styles.footer} pointerEvents="box-none">
        <Button title={t('mapPick.done')} onPress={confirm} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  map: { ...StyleSheet.absoluteFillObject, borderRadius: 0 },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: { fontSize: 46, transform: [{ translateY: -20 }] },
  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  closeIcon: { fontSize: 18, color: colors.text },
  addressCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  addressLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  addressValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
  },
});
