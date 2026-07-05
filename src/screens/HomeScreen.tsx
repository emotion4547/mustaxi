import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { MapPlaceholder } from '@/components/MapPlaceholder';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, radius, spacing } from '@/theme';
import { mockPlaces } from '@/data/mockData';
import type { Place } from '@/types';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useApp();
  const [pickup] = useState<Place>(mockPlaces[0]);
  const [destination, setDestination] = useState<Place | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.mapArea}>
        <MapPlaceholder label={t('common.appName')} />
      </View>

      <View style={styles.sheet}>
        <Text style={styles.heading}>{t('home.where')}</Text>

        <Card style={styles.pointCard}>
          <View style={styles.pointRow}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.pointText} numberOfLines={1}>
              {pickup.title}
            </Text>
          </View>
          <View style={styles.divider} />
          <Pressable
            style={styles.pointRow}
            onPress={() =>
              setDestination((d) => (d ? null : mockPlaces[2]))
            }
          >
            <View style={[styles.dot, { backgroundColor: colors.danger }]} />
            <Text
              style={[
                styles.pointText,
                !destination && styles.pointPlaceholder,
              ]}
              numberOfLines={1}
            >
              {destination ? destination.title : t('home.to')}
            </Text>
          </Pressable>
        </Card>

        <View style={styles.suggestions}>
          {mockPlaces.slice(1).map((place) => (
            <Pressable
              key={place.id}
              style={styles.chip}
              onPress={() => setDestination(place)}
            >
              <Text style={styles.chipText} numberOfLines={1}>
                {place.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          title={t('home.order')}
          disabled={!destination}
          onPress={() =>
            destination &&
            navigation.navigate('Order', { pickup, destination })
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  mapArea: { flex: 1, padding: spacing.md },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heading: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  pointCard: { marginBottom: spacing.md },
  pointRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  pointText: { flex: 1, fontSize: fontSize.md, color: colors.text },
  pointPlaceholder: { color: colors.textMuted },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 22,
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
    maxWidth: '48%',
  },
  chipText: { fontSize: fontSize.sm, color: colors.text },
});
