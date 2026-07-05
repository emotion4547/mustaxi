import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, radius, spacing } from '@/theme';

interface Item {
  key: string;
  label: string;
  glyph: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: 'Prayer' | 'History' | 'Profile') => void;
}

const WIDTH = Math.min(Dimensions.get('window').width * 0.82, 340);

/** Выдвижное боковое меню в стиле Fasten (кастомная анимация, без reanimated). */
export const DrawerMenu: React.FC<Props> = ({ visible, onClose, onNavigate }) => {
  const { t, profile, logout } = useApp();
  const tx = useRef(new Animated.Value(-WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(tx, {
        toValue: visible ? 0 : -WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, tx, fade]);

  const go = (screen: 'Prayer' | 'History' | 'Profile') => {
    onClose();
    setTimeout(() => onNavigate(screen), 180);
  };

  const items: Item[] = [
    { key: 'prayer', label: t('tabs.prayer'), glyph: '🕌', onPress: () => go('Prayer') },
    { key: 'history', label: t('profile.trips'), glyph: '🧾', onPress: () => go('History') },
    { key: 'payment', label: t('profile.payment'), glyph: '💳' },
    { key: 'addresses', label: t('drawer.addresses'), glyph: '📍' },
    { key: 'support', label: t('drawer.support'), glyph: '💬' },
    { key: 'settings', label: t('profile.settings'), glyph: '⚙️', onPress: () => go('Profile') },
    { key: 'info', label: t('drawer.info'), glyph: 'ℹ️' },
  ];

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.root]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.panel, { transform: [{ translateX: tx }] }]}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile.name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {profile.name}
              </Text>
              <Text style={styles.rating}>★ 5.00</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {items.map((it) => (
              <Pressable key={it.key} style={styles.row} onPress={it.onPress}>
                <Text style={styles.glyph}>{it.glyph}</Text>
                <Text style={styles.label}>{it.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </Pressable>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { zIndex: 100 },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.35)' },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: WIDTH,
    backgroundColor: colors.background,
    borderTopRightRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.textInverse, fontSize: fontSize.xl, fontWeight: '800' },
  name: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  rating: { fontSize: fontSize.sm, color: colors.accentDark, marginTop: 2 },
  list: { paddingTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  glyph: { fontSize: 22, width: 28, textAlign: 'center' },
  label: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  logout: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  logoutText: { fontSize: fontSize.md, color: colors.danger, fontWeight: '700' },
});
