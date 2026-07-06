import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, spacing } from '@/theme';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RideDetails'>;

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export const RideDetailsScreen: React.FC<Props> = ({ route }) => {
  const { record } = route.params;
  const { t, locale } = useApp();

  const prefs: string[] = [];
  if (record.preferences.driverGender === 'female') prefs.push(t('order.female'));
  if (record.preferences.driverGender === 'male') prefs.push(t('order.male'));
  if (record.preferences.noMusic) prefs.push(t('order.noMusic'));
  if (record.preferences.quietRide) prefs.push(t('order.quietRide'));
  if (record.preferences.fasting) prefs.push(t('order.fasting'));
  if (record.preferences.prayerStop) prefs.push(t('order.prayerStop'));

  /** Текстовый чек для отправки (мессенджер, почта и т.п.). */
  const shareReceipt = () => {
    const lines = [
      `MusTaxi — ${t('rideDetails.receipt')}`,
      `${record.pickupTitle} → ${record.destinationTitle}`,
      record.fareBase != null
        ? `${t('rideDetails.base')}: ${record.fareBase} ${record.currency}`
        : null,
      record.fareDistance != null
        ? `${t('rideDetails.distance', { km: record.distanceKm ?? 0 })}: ${record.fareDistance} ${record.currency}`
        : null,
      `${t('rideDetails.total')}: ${record.fareTotal} ${record.currency}`,
      `✓ ${t('order.ribaFree')}`,
    ]
      .filter(Boolean)
      .join('\n');
    Share.share({ message: lines }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('rideDetails.title')}</Text>

        <Card style={styles.section}>
          <Text style={styles.route}>{record.pickupTitle}</Text>
          <Text style={styles.arrow}>↓</Text>
          <Text style={styles.route}>{record.destinationTitle}</Text>
        </Card>

        <Card style={styles.section}>
          <Row label={t('rideDetails.driver')} value={record.driverName} />
          <Row
            label={t('order.driverGender')}
            value={
              record.driverGender === 'female'
                ? t('ride.female')
                : t('ride.male')
            }
          />
          {record.carClass && (
            <Row
              label={t('order.carClass')}
              value={t(`order.${record.carClass}`)}
            />
          )}
          <Row
            label={t('rideDetails.date')}
            value={new Date(record.createdAt).toLocaleString(locale)}
          />
          <Row
            label={t('rideDetails.status')}
            value={t('ride.completed')}
          />
        </Card>

        {prefs.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.blockTitle}>{t('home.preferences')}</Text>
            <View style={styles.chips}>
              {prefs.map((p) => (
                <View key={p} style={styles.chip}>
                  <Text style={styles.chipText}>{p}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Оценка водителя */}
        {record.rating != null && (
          <Card style={styles.section}>
            <Text style={styles.blockTitle}>{t('rideDetails.rating')}</Text>
            <Text style={styles.starsLine}>
              {'★'.repeat(record.rating)}
              {'☆'.repeat(Math.max(0, 5 - record.rating))}
            </Text>
            {!!record.comment && (
              <Text style={styles.commentText}>{record.comment}</Text>
            )}
          </Card>
        )}

        {/* Чек поездки */}
        <Card style={[styles.section, styles.fareCard]}>
          <Text style={styles.blockTitle}>{t('rideDetails.receipt')}</Text>
          {record.fareBase != null && (
            <Row
              label={t('rideDetails.base')}
              value={`${record.fareBase} ${record.currency}`}
            />
          )}
          {record.fareDistance != null && (
            <Row
              label={t('rideDetails.distance', { km: record.distanceKm ?? 0 })}
              value={`${record.fareDistance} ${record.currency}`}
            />
          )}
          <View style={styles.totalRow}>
            <Text style={styles.fareLabel}>{t('rideDetails.total')}</Text>
            <Text style={styles.farePrice}>
              {record.fareTotal} {record.currency}
            </Text>
          </View>
          <Text style={styles.ribaFree}>✓ {t('order.ribaFree')}</Text>
          <Button
            title={t('rideDetails.share')}
            variant="secondary"
            onPress={shareReceipt}
            style={{ marginTop: spacing.md }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  section: {},
  route: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  arrow: { color: colors.textMuted, marginVertical: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: { fontSize: fontSize.sm, color: colors.textMuted },
  value: { fontSize: fontSize.sm, color: colors.text, fontWeight: '600' },
  blockTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  fareCard: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  fareLabel: { fontSize: fontSize.md, color: colors.text, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  farePrice: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
  },
  starsLine: {
    fontSize: 26,
    color: colors.accent,
    marginTop: spacing.xs,
    letterSpacing: 4,
  },
  commentText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  ribaFree: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
