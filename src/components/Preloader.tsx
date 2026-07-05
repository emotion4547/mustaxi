import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';

/** Экран загрузки/прелоадер с логотипом (тот же образ, что и на сплэше). */
export const Preloader: React.FC = () => (
  <View style={styles.root}>
    <Image
      source={require('../../assets/splash-icon.png')}
      style={styles.logo}
      resizeMode="contain"
    />
    <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: { width: 168, height: 168 },
});
