import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '@/components/Card';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, spacing } from '@/theme';
import { storage } from '@/services/storage';
import type { RideRecord } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

function formatDate(ts: number, locale: string): string {
  return new Date(ts).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { t, locale } = useApp();
  const [records, setRecords] = useState<RideRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      storage.getHistory().then(setRecords);
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Text style={styles.title}>{t('history.title')}</Text>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={styles.emptyText}>{t('history.empty')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('RideDetails', { record: item })}
          >
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.route} numberOfLines={1}>
                  {item.pickupTitle} → {item.destinationTitle}
                </Text>
                <Text style={styles.price}>
                  {item.fareTotal} {item.currency}
                </Text>
              </View>
              <Text style={styles.meta}>
                {item.driverName} ·{' '}
                {item.driverGender === 'female'
                  ? t('ride.female')
                  : t('ride.male')}
              </Text>
              <Text style={styles.date}>{formatDate(item.createdAt, locale)}</Text>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: {},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  route: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  price: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  meta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4 },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted },
});
