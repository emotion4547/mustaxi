import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';

interface Props {
  label?: string;
}

/**
 * Заглушка карты для MVP-каркаса.
 * В продакшене заменяется на react-native-maps / expo-maps
 * (Google Maps на Android, Apple Maps на iOS) с реальными маркерами
 * водителей, точками подачи/назначения и слоем ближайших мечетей.
 */
export const MapPlaceholder: React.FC<Props> = ({ label = 'Карта' }) => (
  <View style={styles.map}>
    <View style={styles.grid} />
    <View style={styles.pin}>
      <Text style={styles.pinDot}>◉</Text>
    </View>
    <Text style={styles.hint}>{label}</Text>
    <Text style={styles.sub}>react-native-maps подключается здесь</Text>
  </View>
);

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    borderColor: colors.border,
    borderWidth: 0,
    opacity: 0.4,
  },
  pin: { marginBottom: spacing.sm },
  pinDot: { fontSize: 40, color: colors.primary },
  hint: { fontSize: fontSize.lg, color: colors.text, fontWeight: '700' },
  sub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
});
