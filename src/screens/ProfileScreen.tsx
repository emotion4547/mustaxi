import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, spacing } from '@/theme';
import type { Locale } from '@/i18n';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t, profile, locale, setLocale, logout } = useApp();

  const localeSegments: { value: Locale; label: string }[] = [
    { value: 'ru', label: 'Рус' },
    { value: 'ar', label: 'عربي' },
    { value: 'en', label: 'Eng' },
  ];

  const rows: { key: string; label: string; glyph: string; onPress?: () => void }[] =
    [
      {
        key: 'trips',
        label: t('profile.trips'),
        glyph: '🧾',
        onPress: () => navigation.navigate('History'),
      },
      { key: 'payment', label: t('profile.payment'), glyph: '💳' },
      { key: 'settings', label: t('profile.settings'), glyph: '⚙️' },
    ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('profile.title')}</Text>

        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile.name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.phone}>{profile.phone || '—'}</Text>
          </View>
        </Card>

        <Card style={styles.menu}>
          {rows.map((row, i) => (
            <Pressable
              key={row.key}
              onPress={row.onPress}
              style={[styles.menuRow, i < rows.length - 1 && styles.menuDivider]}
            >
              <Text style={styles.menuGlyph}>{row.glyph}</Text>
              <Text style={styles.menuLabel}>{row.label}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </Card>

        <Text style={styles.sectionLabel}>{t('profile.language')}</Text>
        <SegmentedControl
          segments={localeSegments}
          value={locale}
          onChange={setLocale}
        />

        <View style={{ flex: 1 }} />
        <Button title={t('profile.logout')} variant="secondary" onPress={logout} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  userCard: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: fontSize.xl, color: colors.textInverse, fontWeight: '800' },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  phone: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  menu: { paddingVertical: 0 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuGlyph: { fontSize: 20, marginRight: spacing.md },
  menuLabel: { flex: 1, fontSize: fontSize.md, color: colors.text },
  chevron: { fontSize: fontSize.lg, color: colors.textMuted },
  sectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
