import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MapPlaceholder } from '@/components/MapPlaceholder';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, radius, spacing } from '@/theme';
import { pickDriver } from '@/data/mockData';
import type { RideStatus } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Ride'>;

const statusFlow: RideStatus[] = [
  'searching',
  'driver_assigned',
  'arriving',
  'in_progress',
  'completed',
];

export const RideScreen: React.FC<Props> = ({ navigation, route }) => {
  const { preferences } = route.params;
  const { t } = useApp();
  const driver = useMemo(
    () => pickDriver(preferences.driverGender),
    [preferences.driverGender],
  );
  const [statusIndex, setStatusIndex] = useState(0);
  const status = statusFlow[statusIndex];

  // Симуляция жизненного цикла поездки для MVP.
  useEffect(() => {
    if (statusIndex >= statusFlow.length - 1) return;
    const timer = setTimeout(
      () => setStatusIndex((i) => Math.min(i + 1, statusFlow.length - 1)),
      2500,
    );
    return () => clearTimeout(timer);
  }, [statusIndex]);

  const statusText: Record<RideStatus, string> = {
    idle: '',
    searching: t('home.searching'),
    driver_assigned: t('ride.driverAssigned'),
    arriving: t('ride.arriving'),
    in_progress: t('ride.inProgress'),
    completed: t('ride.completed'),
    cancelled: t('ride.cancel'),
  };

  const showDriver = statusIndex >= 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.mapArea}>
        <MapPlaceholder label={statusText[status]} />
      </View>

      <View style={styles.sheet}>
        <View style={styles.statusRow}>
          <Text style={styles.status}>{statusText[status]}</Text>
          {showDriver && status !== 'completed' && (
            <Text style={styles.eta}>
              {t('ride.eta', { min: driver.etaMinutes })}
            </Text>
          )}
        </View>

        {showDriver && (
          <Card style={styles.driverCard}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    driver.gender === 'female' ? colors.female : colors.male,
                },
              ]}
            >
              <Text style={styles.avatarText}>
                {driver.gender === 'female' ? '♀' : '♂'}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.name}</Text>
              <Text style={styles.driverMeta}>
                {driver.carModel} · {driver.carPlate}
              </Text>
              <Text style={styles.driverBadge}>
                {driver.gender === 'female'
                  ? t('ride.female')
                  : t('ride.male')}{' '}
                · ⭐ {driver.rating.toFixed(1)}
              </Text>
            </View>
          </Card>
        )}

        {status === 'completed' ? (
          <Button
            title={t('common.close')}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          />
        ) : (
          <Button
            title={t('ride.cancel')}
            variant="secondary"
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  mapArea: { flex: 1, padding: spacing.md },
  sheet: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.background,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  status: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  eta: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 26, color: colors.textInverse },
  driverInfo: { flex: 1 },
  driverName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  driverMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  driverBadge: { fontSize: fontSize.sm, color: colors.primary, marginTop: 4 },
});
