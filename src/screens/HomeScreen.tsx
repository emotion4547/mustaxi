import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppMap } from '@/components/AppMap';
import { DrawerMenu } from '@/components/DrawerMenu';
import { useApp } from '@/store/AppContext';
import { useCurrentLocation } from '@/features/location/useCurrentLocation';
import { reverseGeocode } from '@/services/geocoding';
import { storage } from '@/services/storage';
import { colors, fontSize, radius, spacing } from '@/theme';
import { mockPlaces, pickDriver } from '@/data/mockData';
import { KIND_GLYPHS } from '@/screens/SavedAddressesScreen';
import { fetchNearbyMosques } from '@/features/prayer/mosques';
import {
  computePrayerSchedule,
  formatPrayerTime,
} from '@/features/prayer/prayerTimes';
import type { Place, SavedAddress } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const SUPPLY_ETA = pickDriver('any').etaMinutes;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t, locale, preferences, pickup, setPickup, destination, setDestination } =
    useApp();
  const { location, granted } = useCurrentLocation();
  const [drawer, setDrawer] = useState(false);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [showMosques, setShowMosques] = useState(false);
  const [mosques, setMosques] = useState<Place[]>([]);

  // Слой мечетей: загружаем при включении переключателя.
  useEffect(() => {
    let active = true;
    if (!showMosques) {
      setMosques([]);
      return;
    }
    fetchNearbyMosques(
      pickup?.location ?? location,
      7,
      t('prayer.mosqueDefault'),
    ).then((list) => active && setMosques(list));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMosques]);

  // Режим Рамадан: время ифтара (Магриб) для баннера.
  const iftarTime = useMemo(() => {
    if (!preferences.fasting) return null;
    try {
      const schedule = computePrayerSchedule(pickup?.location ?? location);
      return formatPrayerTime(schedule.times.maghrib, locale);
    } catch {
      return null;
    }
  }, [preferences.fasting, pickup, location, locale]);

  // Сохранённые адреса обновляем при каждом возврате на экран.
  useFocusEffect(
    useCallback(() => {
      storage.getSavedAddresses().then(setSaved);
    }, []),
  );

  useEffect(() => {
    if (pickup) return;
    const place: Place = { id: 'my-location', title: t('home.myLocation'), location };
    setPickup(place);
    if (granted) {
      reverseGeocode(location).then((name) => {
        if (name) setPickup({ ...place, title: name });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, granted]);

  const chooseDestination = (place: Place) => {
    setDestination(place);
    if (pickup) navigation.navigate('Order', { pickup, destination: place });
  };

  return (
    <View style={styles.root}>
      {/* Карта на весь экран */}
      <View style={StyleSheet.absoluteFill}>
        <AppMap
          pickup={pickup?.location ?? location}
          destination={destination?.location}
          pickupBadge={t('home.supply', { min: SUPPLY_ETA })}
          mosques={mosques}
          style={styles.map}
        />
      </View>

      {/* Шапка: меню + адрес подачи */}
      <SafeAreaView edges={['top']} style={styles.headerWrap} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          <Pressable style={styles.menuBtn} onPress={() => setDrawer(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
          <Pressable
            style={styles.address}
            onPress={() => navigation.navigate('SearchLocation', { target: 'pickup' })}
          >
            <Text style={styles.addressLabel}>{t('home.yourAddress')} ›</Text>
            <Text style={styles.addressValue} numberOfLines={1}>
              {pickup?.title ?? t('home.myLocation')}
            </Text>
          </Pressable>
          {/* Переключатель слоя мечетей */}
          <Pressable
            style={[styles.menuBtn, showMosques && styles.mosqueBtnActive]}
            onPress={() => setShowMosques((v) => !v)}
            accessibilityLabel={t('home.mosques')}
          >
            <Text style={styles.menuIcon}>🕌</Text>
          </Pressable>
        </View>

        {/* Баннер Рамадана: время ифтара */}
        {iftarTime && (
          <View style={styles.iftarPill}>
            <Text style={styles.iftarText}>
              🌙 {t('ramadan.iftarAt', { time: iftarTime })}
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* Нижняя «шторка» */}
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Pressable
          style={styles.whereBtn}
          onPress={() => navigation.navigate('SearchLocation', { target: 'destination' })}
        >
          <Text style={styles.whereIcon}>🏳️</Text>
          <Text style={styles.whereText}>{t('home.where')}</Text>
          <Text style={styles.whereArrow}>›</Text>
        </Pressable>

        <ScrollView
          style={styles.places}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {saved.map((addr) => (
            <Pressable
              key={addr.id}
              style={styles.placeRow}
              onPress={() => chooseDestination(addr.place)}
            >
              <View style={styles.placePin}>
                <Text style={styles.placePinIcon}>{KIND_GLYPHS[addr.kind]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.placeTitle} numberOfLines={1}>
                  {addr.label}
                </Text>
                <Text style={styles.placeSub} numberOfLines={1}>
                  {addr.place.subtitle || addr.place.title}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
          {mockPlaces.map((place) => (
            <Pressable
              key={place.id}
              style={styles.placeRow}
              onPress={() => chooseDestination(place)}
            >
              <View style={styles.placePin}>
                <Text style={styles.placePinIcon}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.placeTitle} numberOfLines={1}>
                  {place.title}
                </Text>
                {!!place.subtitle && (
                  <Text style={styles.placeSub} numberOfLines={1}>
                    {place.subtitle}
                  </Text>
                )}
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <DrawerMenu
        visible={drawer}
        onClose={() => setDrawer(false)}
        onNavigate={(screen) => navigation.navigate(screen)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  map: { borderRadius: 0 },

  headerWrap: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  menuBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  menuIcon: { fontSize: 22, color: colors.text },
  mosqueBtnActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iftarPill: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  iftarText: {
    color: colors.textInverse,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  address: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  addressLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  addressValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '46%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  whereBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  whereIcon: { fontSize: 18, marginRight: spacing.sm },
  whereText: { flex: 1, fontSize: fontSize.md, fontWeight: '800', color: colors.primaryDark },
  whereArrow: { fontSize: fontSize.lg, color: colors.primary, fontWeight: '800' },
  places: { flexGrow: 0 },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  placePin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placePinIcon: { fontSize: 17 },
  placeTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  placeSub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: fontSize.lg, color: colors.textMuted },
});
