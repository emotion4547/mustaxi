import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, radius, spacing } from '@/theme';
import {
  computePrayerSchedule,
  formatPrayerTime,
  type PrayerKey,
  type PrayerSchedule,
} from '@/features/prayer/prayerTimes';
import { mockPlaces } from '@/data/mockData';
import type { LatLng } from '@/types';

const prayerOrder: PrayerKey[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const PrayerScreen: React.FC = () => {
  const { t, locale } = useApp();
  const [permission, setPermission] = useState<boolean | null>(null);
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);

  const load = async (point: LatLng) => {
    setSchedule(computePrayerSchedule(point));
  };

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setPermission(true);
      const pos = await Location.getCurrentPositionAsync({});
      await load({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } else {
      setPermission(false);
      // Фолбэк: считаем по координатам Московской Соборной мечети.
      await load(mockPlaces[0].location);
    }
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('prayer.title')}</Text>

        {!schedule && permission === null && (
          <Text style={styles.muted}>…</Text>
        )}

        {permission === false && !schedule && (
          <Card style={styles.section}>
            <Text style={styles.muted}>{t('prayer.locationNeeded')}</Text>
            <Button
              title={t('prayer.allowLocation')}
              onPress={requestLocation}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        )}

        {schedule && (
          <>
            {/* Следующий намаз */}
            <Card style={[styles.section, styles.nextCard]}>
              <Text style={styles.nextLabel}>{t('prayer.next')}</Text>
              <Text style={styles.nextName}>
                {t(`prayer.${schedule.next}`)}
              </Text>
              <Text style={styles.nextTime}>
                {formatPrayerTime(schedule.nextAt, locale)}
              </Text>
            </Card>

            {/* Кибла */}
            <Card style={styles.section}>
              <View style={styles.qiblaRow}>
                <Text style={styles.qiblaCompass}>🧭</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.qiblaTitle}>{t('prayer.qibla')}</Text>
                  <Text style={styles.muted}>
                    {t('prayer.qiblaHint', {
                      deg: Math.round(schedule.qiblaDegrees),
                    })}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Расписание */}
            <Card style={styles.section}>
              {prayerOrder.map((key) => {
                const isNext = key === schedule.next;
                return (
                  <View key={key} style={styles.prayerRow}>
                    <Text
                      style={[styles.prayerName, isNext && styles.prayerActive]}
                    >
                      {t(`prayer.${key}`)}
                    </Text>
                    <Text
                      style={[styles.prayerTime, isNext && styles.prayerActive]}
                    >
                      {formatPrayerTime(schedule.times[key], locale)}
                    </Text>
                  </View>
                );
              })}
            </Card>

            {/* Ближайшая мечеть */}
            <Card style={styles.section}>
              <Text style={styles.qiblaTitle}>{t('prayer.nearbyMosque')}</Text>
              <Text style={styles.mosque}>{mockPlaces[0].title}</Text>
              <Text style={styles.muted}>{mockPlaces[0].subtitle}</Text>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  section: { marginTop: spacing.xs },
  muted: { fontSize: fontSize.sm, color: colors.textMuted },
  nextCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  nextLabel: {
    fontSize: fontSize.sm,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  nextName: {
    fontSize: fontSize.xxl,
    color: colors.textInverse,
    fontWeight: '800',
    marginTop: 4,
  },
  nextTime: {
    fontSize: fontSize.lg,
    color: colors.textInverse,
    marginTop: 2,
  },
  qiblaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qiblaCompass: { fontSize: 36 },
  qiblaTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  prayerName: { fontSize: fontSize.md, color: colors.text },
  prayerTime: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  prayerActive: { color: colors.primary, fontWeight: '800' },
  mosque: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
