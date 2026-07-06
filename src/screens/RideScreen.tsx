import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppMap } from '@/components/AppMap';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, radius, spacing } from '@/theme';
import { createRide, subscribeRide, type CreatedRide } from '@/services/api';
import { storage } from '@/services/storage';
import type { LatLng, RideStatus } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Ride'>;

export const RideScreen: React.FC<Props> = ({ navigation, route }) => {
  const { pickup, destination, preferences, carClass } = route.params;
  const { t } = useApp();

  const [ride, setRide] = useState<CreatedRide | null>(null);
  const [status, setStatus] = useState<RideStatus>('searching');
  const [eta, setEta] = useState(0);
  const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);
  const savedRef = useRef(false);

  // 1) Создаём заказ и подписываемся на обновления.
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let active = true;

    createRide({ pickup, destination, preferences, carClass }).then((created) => {
      if (!active) return;
      setRide(created);
      setDriverLoc(created.driver.location);
      unsub = subscribeRide(created, (update) => {
        setStatus(update.status);
        setEta(update.etaMinutes);
        setDriverLoc(update.driverLocation);
      });
    });

    return () => {
      active = false;
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) По завершении сохраняем поездку в историю (один раз).
  useEffect(() => {
    if (status !== 'completed' || !ride || savedRef.current) return;
    savedRef.current = true;
    storage.addHistory({
      id: ride.id,
      pickupTitle: pickup.title,
      destinationTitle: destination.title,
      driverName: ride.driver.name,
      driverGender: ride.driver.gender,
      fareTotal: ride.fare.total,
      currency: ride.fare.currency,
      status: 'completed',
      preferences,
      carClass,
      createdAt: Date.now(),
    });
  }, [status, ride, pickup, destination, preferences, carClass]);

  const statusText: Record<RideStatus, string> = {
    idle: '',
    searching: t('home.searching'),
    driver_assigned: t('ride.driverAssigned'),
    arriving: t('ride.arriving'),
    in_progress: t('ride.inProgress'),
    completed: t('ride.completed'),
    cancelled: t('ride.cancel'),
  };

  const goHome = () => navigation.navigate('Home');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.mapArea}>
        <AppMap
          pickup={pickup.location}
          destination={destination.location}
          driver={driverLoc}
          showLocate={false}
        />
      </View>

      <View style={styles.sheet}>
        <View style={styles.statusRow}>
          <Text style={styles.status}>{statusText[status]}</Text>
          {ride && status !== 'completed' && status !== 'searching' && (
            <Text style={styles.eta}>{t('ride.eta', { min: eta })}</Text>
          )}
        </View>

        {!ride ? (
          <View style={styles.searching}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.searchingText}>{t('home.searching')}</Text>
          </View>
        ) : (
          <Card style={styles.driverCard}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    ride.driver.gender === 'female'
                      ? colors.female
                      : colors.male,
                },
              ]}
            >
              <Text style={styles.avatarText}>
                {ride.driver.gender === 'female' ? '♀' : '♂'}
              </Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{ride.driver.name}</Text>
              <Text style={styles.driverMeta}>
                {ride.driver.carModel} · {ride.driver.carPlate}
              </Text>
              <Text style={styles.driverBadge}>
                {ride.driver.gender === 'female'
                  ? t('ride.female')
                  : t('ride.male')}{' '}
                · ⭐ {ride.driver.rating.toFixed(1)}
              </Text>
            </View>
            <Text style={styles.fare}>
              {ride.fare.total} {ride.fare.currency}
            </Text>
          </Card>
        )}

        {status === 'completed' ? (
          <Button title={t('common.close')} onPress={goHome} />
        ) : (
          <Button
            title={t('ride.cancel')}
            variant="secondary"
            onPress={goHome}
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
  searching: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  searchingText: { fontSize: fontSize.md, color: colors.textMuted },
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
  fare: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
});
