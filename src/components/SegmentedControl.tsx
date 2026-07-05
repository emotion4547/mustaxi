import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '@/theme';

export interface Segment<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
}

/** Горизонтальный переключатель (напр. пол водителя: любой/муж/жен). */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.container}>
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '600' },
  labelActive: { color: colors.primary },
});
