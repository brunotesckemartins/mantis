
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import GlassButton from '../components/GlassButton';
import { SPACING } from '../theme';

export default function Login({ navigation }: any) {
  const { signIn } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setErrorMsg('');

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setErrorMsg('Preencha e-mail e senha.');
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      await signIn(cleanEmail, password);
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao tentar entrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <XmbBackground>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.logo, { color: colors.textPrimary }]}>
              MANTIS
            </Text>

            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              CAMPUS SYSTEMS
            </Text>

            <Text style={[styles.welcome, { color: colors.textPrimary }]}>
              Bem-vindo de volta
            </Text>

            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Entre com seus dados para continuar.
            </Text>
          </View>

          <View
            style={[
              styles.form,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              E-mail
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundDeep,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Digite seu e-mail"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Senha
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundDeep,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Digite sua senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            {errorMsg ? (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: 'rgba(224, 108, 117, 0.12)' },
                ]}
              >
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.statusDanger },
                  ]}
                >
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={submitting}
              onPress={handleLogin}
              style={styles.loginButtonContainer}
            >
              <View
                style={[
                  styles.loginButton,
                  {
                    backgroundColor: colors.accentSilver,
                    opacity: submitting ? 0.6 : 1,
                  },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text
                    style={[
                      styles.loginButtonText,
                      { color: colors.background },
                    ]}
                  >
                    Entrar
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <View
              style={[
                styles.divider,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={[styles.registerText, { color: colors.textSecondary }]}>
                Não tem uma conta?{' '}
                <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>
                  Cadastre-se
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },

  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  logo: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 10,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 11,
    letterSpacing: 4,
    marginTop: SPACING.xs,
  },

  welcome: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: SPACING.xl,
  },

  description: {
    fontSize: 14,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  form: {
    width: '100%',
    padding: SPACING.lg,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    marginBottom: SPACING.md,
  },

  errorContainer: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },

  errorText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  loginButtonContainer: {
    marginTop: SPACING.sm,
  },

  loginButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  divider: {
    height: 1,
    marginVertical: SPACING.lg,
  },

  registerButton: {
    alignItems: 'center',
  },

  registerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
