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

type Step = 'phone' | 'code';

export const LoginScreen: React.FC = () => {
  const { t, sendOtp, confirmOtp } = useApp();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const phoneValid = phone.replace(/\D/g, '').length >= 10;
  const codeValid = code.replace(/\D/g, '').length >= 4;

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    try {
      const dc = await sendOtp(phone);
      setDemoCode(dc);
      setStep('code');
    } catch {
      setError(t('login.sendError'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await confirmOtp(phone, code);
    } catch {
      setError(t('login.wrongCode'));
    } finally {
      setLoading(false);
    }
  };

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
          {step === 'phone' ? (
            <>
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
            </>
          ) : (
            <>
              <Text style={styles.title}>{t('login.enterCode')}</Text>
              <Text style={styles.subtitle}>
                {t('login.codeSent', { phone })}
              </Text>
              <Text style={styles.label}>{t('login.code')}</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="0000"
                placeholderTextColor={colors.textMuted}
                maxLength={4}
                autoFocus
              />
              {!!demoCode && (
                <Text style={styles.demo}>
                  {t('login.demoHint', { code: demoCode })}
                </Text>
              )}
            </>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.footer}>
          {step === 'phone' ? (
            <Button
              title={t('login.continue')}
              onPress={handleSendCode}
              disabled={!phoneValid}
              loading={loading}
            />
          ) : (
            <>
              <Button
                title={t('login.verify')}
                onPress={handleConfirm}
                disabled={!codeValid}
                loading={loading}
              />
              <Button
                title={t('common.back')}
                variant="ghost"
                onPress={() => {
                  setStep('phone');
                  setCode('');
                  setError('');
                }}
                style={{ marginTop: spacing.xs }}
              />
            </>
          )}
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
  codeInput: {
    letterSpacing: 12,
    textAlign: 'center',
    fontSize: fontSize.xxl,
  },
  demo: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: { paddingBottom: spacing.lg },
  terms: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
