import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Toggle } from '@/components/Toggle';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, spacing } from '@/theme';
import { estimateFare, formatPrice } from '@/features/payment/fare';
import type { DriverGenderPreference, PaymentMethod } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Order'>;

export const OrderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { pickup, destination } = route.params;
  const { t, preferences, setPreferences } = useApp();
  const [payment, setPayment] = useState<PaymentMethod>('cash');

  const fare = useMemo(
    () => estimateFare(pickup.location, destination.location),
    [pickup, destination],
  );

  const genderSegments: { value: DriverGenderPreference; label: string }[] = [
    { value: 'any', label: t('order.any') },
    { value: 'male', label: t('order.male') },
    { value: 'female', label: t('order.female') },
  ];

  const paymentSegments: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: t('order.cash') },
    { value: 'card', label: t('order.card') },
    { value: 'wallet', label: t('order.wallet') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('order.title')}</Text>

        <Card style={styles.section}>
          <Text style={styles.route} numberOfLines={1}>
            {pickup.title}
          </Text>
          <Text style={styles.routeArrow}>↓</Text>
          <Text style={styles.route} numberOfLines={1}>
            {destination.title}
          </Text>
        </Card>

        {/* Пол водителя */}
        <Text style={styles.sectionLabel}>{t('order.driverGender')}</Text>
        <SegmentedControl
          segments={genderSegments}
          value={preferences.driverGender}
          onChange={(driverGender) =>
            setPreferences({ ...preferences, driverGender })
          }
        />

        {/* Настройки поездки по нормам */}
        <Card style={styles.section}>
          <Toggle
            label={t('order.noMusic')}
            value={preferences.noMusic}
            onValueChange={(noMusic) =>
              setPreferences({ ...preferences, noMusic })
            }
          />
          <Toggle
            label={t('order.quietRide')}
            value={preferences.quietRide}
            onValueChange={(quietRide) =>
              setPreferences({ ...preferences, quietRide })
            }
          />
          <Toggle
            label={t('order.fasting')}
            value={preferences.fasting}
            onValueChange={(fasting) =>
              setPreferences({ ...preferences, fasting })
            }
          />
          <Toggle
            label={t('order.prayerStop')}
            value={preferences.prayerStop}
            onValueChange={(prayerStop) =>
              setPreferences({ ...preferences, prayerStop })
            }
          />
        </Card>

        {/* Оплата */}
        <Text style={styles.sectionLabel}>{t('order.payment')}</Text>
        <SegmentedControl
          segments={paymentSegments}
          value={payment}
          onChange={setPayment}
        />

        {/* Тариф */}
        <Card style={[styles.section, styles.fareCard]}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>{t('order.fare')}</Text>
            <Text style={styles.farePrice}>
              {formatPrice(fare.total, fare.currency)}
            </Text>
          </View>
          <Text style={styles.fareBreakdown}>
            {formatPrice(fare.base, fare.currency)} +{' '}
            {fare.distanceKm} км × {formatPrice(fare.distanceFare, fare.currency)}
          </Text>
          <Text style={styles.ribaFree}>✓ {t('order.ribaFree')}</Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('order.confirmOrder', {
            price: formatPrice(fare.total, fare.currency),
          })}
          onPress={() =>
            navigation.replace('Ride', {
              pickup,
              destination,
              preferences,
            })
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  section: { marginTop: spacing.xs },
  sectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  route: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  routeArrow: { color: colors.textMuted, marginVertical: 2 },
  fareCard: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  farePrice: { fontSize: fontSize.xl, color: colors.primary, fontWeight: '800' },
  fareBreakdown: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  ribaFree: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
