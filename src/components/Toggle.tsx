import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '@/theme';

interface Props {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  hint?: string;
}

/** Строка-переключатель для настроек поездки (без музыки, пост и т.д.). */
export const Toggle: React.FC<Props> = ({ label, value, onValueChange, hint }) => (
  <View style={styles.row}>
    <View style={styles.textCol}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.background}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  textCol: { flex: 1, paddingRight: spacing.md },
  label: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
});
