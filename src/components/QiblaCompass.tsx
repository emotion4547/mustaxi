import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize } from '@/theme';
import { useCompass } from '@/features/prayer/useCompass';

interface Props {
  /** Азимут на Каабу от текущей точки (град. от севера). */
  qiblaDegrees: number;
}

const SIZE = 220;

/**
 * Живой компас Киблы. Роза ветров вращается против курса устройства
 * (север всегда указывает на реальный север), а золотой указатель —
 * на направление к Каабе. Когда телефон повёрнут прямо на Киблу,
 * указатель смотрит вверх и подсвечивается «выравнивание».
 */
export const QiblaCompass: React.FC<Props> = ({ qiblaDegrees }) => {
  const { heading, available } = useCompass();

  // Куда рисовать указатель Киблы относительно верха экрана.
  const qiblaRelative = (qiblaDegrees - heading + 360) % 360;
  const aligned = Math.min(qiblaRelative, 360 - qiblaRelative) < 6;

  return (
    <View style={styles.container}>
      <View style={[styles.dial, { transform: [{ rotate: `${-heading}deg` }] }]}>
        <Text style={[styles.cardinal, styles.north]}>N</Text>
        <Text style={[styles.cardinal, styles.east]}>E</Text>
        <Text style={[styles.cardinal, styles.south]}>S</Text>
        <Text style={[styles.cardinal, styles.west]}>W</Text>
      </View>

      {/* Указатель Киблы — вращается в системе координат устройства. */}
      <View
        style={[
          styles.needle,
          { transform: [{ rotate: `${qiblaRelative}deg` }] },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.kaaba, aligned && styles.kaabaAligned]}>
          <Text style={styles.kaabaIcon}>🕋</Text>
        </View>
        <View style={[styles.arrow, aligned && styles.arrowAligned]} />
      </View>

      <View style={styles.center} />

      {!available && (
        <Text style={styles.warn}>Компас недоступен на этом устройстве</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dial: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardinal: {
    position: 'absolute',
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  north: { top: 8, left: SIZE / 2 - 10, color: colors.danger },
  east: { right: 8, top: SIZE / 2 - 10 },
  south: { bottom: 8, left: SIZE / 2 - 10 },
  west: { left: 8, top: SIZE / 2 - 10 },
  needle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  kaaba: {
    marginTop: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  kaabaAligned: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  kaabaIcon: { fontSize: 22 },
  arrow: {
    width: 0,
    height: 0,
    marginTop: 4,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.accent,
  },
  arrowAligned: { borderBottomColor: colors.primary },
  center: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.text,
  },
  warn: {
    position: 'absolute',
    bottom: -28,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
});
