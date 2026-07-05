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
import { mockPlaces } from '@/data/mockData';
import type { Place } from '@/types';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchLocation'>;

export const SearchLocationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { target } = route.params;
  const { t, setPickup, setDestination } = useApp();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce + отмена предыдущего запроса.
  useEffect(() => {
    const q = query.trim();
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
      } catch {
        // отменённый или сетевой сбой — просто ничего не показываем
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => clearTimeout(handle);
  }, [query]);

  const choose = (place: Place) => {
    if (target === 'pickup') setPickup(place);
    else setDestination(place);
    navigation.goBack();
  };

  const showSuggestions = query.trim().length < 3;
  const data = showSuggestions ? mockPlaces : results;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.title}>
          {target === 'pickup' ? t('home.from') : t('home.to')}
        </Text>
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

      {showSuggestions && (
        <Text style={styles.sectionLabel}>{t('search.quick')}</Text>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading && !showSuggestions ? (
            <Text style={styles.empty}>{t('search.empty')}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => choose(item)}>
            <View style={styles.pin}>
              <Text style={styles.pinIcon}>📍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {!!item.subtitle && (
                <Text style={styles.rowSub} numberOfLines={1}>
                  {item.subtitle}
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
