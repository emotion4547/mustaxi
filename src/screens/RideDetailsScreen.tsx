import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '@/components/Card';
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

        <Card style={[styles.section, styles.fareCard]}>
          <Text style={styles.fareLabel}>{t('order.fare')}</Text>
          <Text style={styles.farePrice}>
            {record.fareTotal} {record.currency}
          </Text>
          <Text style={styles.ribaFree}>✓ {t('order.ribaFree')}</Text>
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
  fareLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  farePrice: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  ribaFree: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
