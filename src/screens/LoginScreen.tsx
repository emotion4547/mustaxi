import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { useApp } from '@/store/AppContext';
import { colors, fontSize, radius, spacing } from '@/theme';

export const LoginScreen: React.FC = () => {
  const { t, login } = useApp();
  const [phone, setPhone] = useState('');

  const canContinue = phone.replace(/\D/g, '').length >= 10;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🕌</Text>
          <Text style={styles.brand}>{t('common.appName')}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

          <Text style={styles.label}>{t('login.phone')}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+7 900 000-00-00"
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </View>

        <View style={styles.footer}>
          <Button
            title={t('login.continue')}
            onPress={() => login(phone)}
            disabled={!canContinue}
          />
          <Text style={styles.terms}>{t('login.terms')}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1, paddingHorizontal: spacing.lg },
  header: { alignItems: 'center', marginTop: spacing.xxl },
  logo: { fontSize: 56 },
  brand: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  body: { flex: 1, justifyContent: 'center' },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  footer: { paddingBottom: spacing.lg },
  terms: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
