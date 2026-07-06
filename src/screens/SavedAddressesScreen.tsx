import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Card } from '@/components/Card';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, spacing } from '@/theme';
import { storage } from '@/services/storage';
import type { SavedAddress, SavedAddressKind } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedAddresses'>;

export const KIND_GLYPHS: Record<SavedAddressKind, string> = {
  home: '🏠',
  work: '💼',
  custom: '📍',
};

export const SavedAddressesScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useApp();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  useFocusEffect(
    useCallback(() => {
      storage.getSavedAddresses().then(setAddresses);
    }, []),
  );

  const remove = async (id: string) => {
    await storage.removeAddress(id);
    setAddresses(await storage.getSavedAddresses());
  };

  const addKind = (kind: SavedAddressKind) =>
    navigation.navigate('SearchLocation', { target: 'destination', saveAs: kind });

  const hasHome = addresses.some((a) => a.kind === 'home');
  const hasWork = addresses.some((a) => a.kind === 'work');

  const addButtons: { kind: SavedAddressKind; label: string }[] = [
    ...(!hasHome ? [{ kind: 'home' as const, label: t('saved.addHome') }] : []),
    ...(!hasWork ? [{ kind: 'work' as const, label: t('saved.addWork') }] : []),
    { kind: 'custom', label: t('saved.addCustom') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Text style={styles.title}>{t('saved.title')}</Text>

      <FlatList
        data={addresses}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('saved.empty')}</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <Text style={styles.glyph}>{KIND_GLYPHS[item.kind]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                {item.place.subtitle || item.place.title}
              </Text>
            </View>
            <Pressable hitSlop={10} onPress={() => remove(item.id)}>
              <Text style={styles.delete}>✕</Text>
            </Pressable>
          </Card>
        )}
        ListFooterComponent={
          <View style={styles.addBlock}>
            {addButtons.map((b) => (
              <Pressable
                key={b.kind}
                style={styles.addRow}
                onPress={() => addKind(b.kind)}
              >
                <Text style={styles.addPlus}>＋</Text>
                <Text style={styles.addLabel}>{b.label}</Text>
              </Pressable>
            ))}
          </View>
        }
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
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  glyph: { fontSize: 24 },
  label: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  delete: { fontSize: fontSize.md, color: colors.textMuted, padding: 4 },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginVertical: spacing.xl,
  },
  addBlock: { marginTop: spacing.md },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  addPlus: { fontSize: 20, color: colors.primary, width: 28, textAlign: 'center' },
  addLabel: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
});
