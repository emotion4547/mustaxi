import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { AppMap } from '@/components/AppMap';
import { Button } from '@/components/Button';
import { useApp } from '@/store/AppContext';
import { useCurrentLocation } from '@/features/location/useCurrentLocation';
import { reverseGeocode } from '@/services/geocoding';
import { colors, fontSize, radius, spacing } from '@/theme';
import { mockPlaces } from '@/data/mockData';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t, pickup, setPickup, destination, setDestination } = useApp();
  const { location, granted } = useCurrentLocation();

  // Точка подачи по умолчанию — текущая геолокация (если ещё не выбрана).
  useEffect(() => {
    if (pickup) return;
    const place = {
      id: 'my-location',
      title: t('home.myLocation'),
      location,
    };
    setPickup(place);
    // Уточняем адрес обратным геокодированием (не критично, если не выйдет).
    if (granted) {
      reverseGeocode(location).then((name) => {
        if (name) setPickup({ ...place, title: name });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, granted]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.mapArea}>
        <AppMap
          pickup={pickup?.location ?? location}
          destination={destination?.location}
        />
      </View>

      <View style={styles.sheet}>
        <Text style={styles.heading}>{t('home.where')}</Text>

        {/* Поля маршрута — тап открывает поиск адреса */}
        <View style={styles.fields}>
          <Pressable
            style={styles.fieldRow}
            onPress={() => navigation.navigate('SearchLocation', { target: 'pickup' })}
          >
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.fieldText} numberOfLines={1}>
              {pickup?.title ?? t('home.from')}
            </Text>
            <Text style={styles.edit}>✎</Text>
          </Pressable>

          <View style={styles.fieldDivider} />

          <Pressable
            style={styles.fieldRow}
            onPress={() =>
              navigation.navigate('SearchLocation', { target: 'destination' })
            }
          >
            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
            <Text
              style={[styles.fieldText, !destination && styles.placeholder]}
              numberOfLines={1}
            >
              {destination?.title ?? t('home.to')}
            </Text>
            <Text style={styles.edit}>✎</Text>
          </Pressable>
        </View>

        {/* Быстрые адреса */}
        <View style={styles.suggestions}>
          {mockPlaces.slice(0, 3).map((place) => {
            const active = destination?.id === place.id;
            return (
              <Pressable
                key={place.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setDestination(place)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                  numberOfLines={1}
                >
                  {place.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          title={t('home.order')}
          disabled={!pickup || !destination}
          onPress={() =>
            pickup &&
            destination &&
            navigation.navigate('Order', { pickup, destination })
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  mapArea: { flex: 1, padding: spacing.md, paddingBottom: 0 },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    marginTop: -spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  fields: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  dot: { width: 11, height: 11, borderRadius: 6, marginRight: spacing.md },
  fieldText: { flex: 1, fontSize: fontSize.md, color: colors.text },
  placeholder: { color: colors.textMuted },
  edit: { fontSize: fontSize.md, color: colors.textMuted },
  fieldDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 23,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '100%',
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.textInverse, fontWeight: '600' },
});
