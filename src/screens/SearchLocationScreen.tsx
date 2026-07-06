import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useApp } from '@/store/AppContext';
import { colors, fontSize, radius, spacing } from '@/theme';
import { searchPlaces } from '@/services/geocoding';
import { storage } from '@/services/storage';
import { mockPlaces } from '@/data/mockData';
import { KIND_GLYPHS } from '@/screens/SavedAddressesScreen';
import type { Place, SavedAddress } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchLocation'>;

/** Строка списка: место + иконка (сохранённые — со своими значками). */
interface Row {
  key: string;
  glyph: string;
  place: Place;
  label?: string;
}

export const SearchLocationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { target, saveAs } = route.params;
  const { t, setPickup, setDestination } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    storage.getSavedAddresses().then(setSaved);
  }, []);

  // Debounce + отмена предыдущего запроса.
  useEffect(() => {
    const q = query.trim();
    setError(false);
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const found = await searchPlaces(q, controller.signal);
        setResults(found);
      } catch (e) {
        // Отменённый запрос — не ошибка; сетевой сбой показываем пользователю.
        if (!(e instanceof Error && e.name === 'AbortError')) setError(true);
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => clearTimeout(handle);
  }, [query]);

  const choose = async (place: Place) => {
    if (saveAs) {
      await storage.saveAddress({
        id: `addr-${Date.now()}`,
        kind: saveAs,
        label: saveAs === 'custom' ? place.title : t(`saved.${saveAs}`),
        place,
        createdAt: Date.now(),
      });
      navigation.goBack();
      return;
    }
    if (target === 'pickup') setPickup(place);
    else setDestination(place);
    navigation.goBack();
  };

  const showSuggestions = query.trim().length < 3;
  const rows: Row[] = showSuggestions
    ? [
        // При выборе точки — сохранённые адреса первыми; при сохранении не нужны.
        ...(!saveAs
          ? saved.map((a) => ({
              key: a.id,
              glyph: KIND_GLYPHS[a.kind],
              place: a.place,
              label: a.label,
            }))
          : []),
        ...mockPlaces.map((p) => ({ key: p.id, glyph: '📍', place: p })),
      ]
    : results.map((p) => ({ key: p.id, glyph: '📍', place: p }));

  const headerTitle = saveAs
    ? t('saved.addTitle')
    : target === 'pickup'
      ? t('home.from')
      : t('home.to');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.title}>{headerTitle}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textMuted}
          autoFocus
          returnKeyType="search"
        />
        {loading && <ActivityIndicator color={colors.primary} />}
      </View>

      {/* Выбор точки на карте (не в режиме сохранения адреса) */}
      {!saveAs && showSuggestions && (
        <Pressable
          style={styles.mapRow}
          onPress={() => navigation.navigate('MapPick', { target })}
        >
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapLabel}>{t('search.onMap')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}

      {error && <Text style={styles.error}>{t('search.error')}</Text>}

      {showSuggestions && !saveAs && (
        <Text style={styles.sectionLabel}>{t('search.quick')}</Text>
      )}

      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && !showSuggestions && !error ? (
            <Text style={styles.empty}>{t('search.empty')}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => choose(item.place)}>
            <View style={styles.pin}>
              <Text style={styles.pinIcon}>{item.glyph}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.label ?? item.place.title}
              </Text>
              {!!(item.label ? item.place.title : item.place.subtitle) && (
                <Text style={styles.rowSub} numberOfLines={1}>
                  {item.label ? item.place.title : item.place.subtitle}
                </Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cancel: { fontSize: fontSize.md, color: colors.primary, width: 60 },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 50,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: fontSize.md, color: colors.text },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
  },
  mapIcon: { fontSize: 18 },
  mapLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  chevron: { fontSize: fontSize.lg, color: colors.primary, fontWeight: '800' },
  error: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    color: colors.danger,
    fontSize: fontSize.sm,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  list: { padding: spacing.lg, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: { fontSize: 18 },
  rowTitle: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  rowSub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontSize: fontSize.md,
  },
});
