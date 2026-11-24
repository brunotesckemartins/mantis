
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
import { Picker } from '@react-native-picker/picker';

import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import api from '../api/client';
import XmbBackground from '../components/XmbBackground';
import { SPACING } from '../theme';

export default function Register({ navigation }: any) {
  const { colors } = useContext(ThemeContext);
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('requester');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password) {
      showToast('Preencha todos os campos.', 'error');
      return;
    }

    if (!cleanEmail.includes('@')) {
      showToast('Informe um e-mail válido.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast(
        'A senha precisa ter no mínimo 6 caracteres.',
        'error',
      );
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      await api.post(
        '/auth',
        {
          user: {
            name: cleanName,
            email: cleanEmail,
            password,
            password_confirmation: password,
            role,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      showToast('Conta criada com sucesso! Faça login.', 'success');
      navigation.goBack();
    } catch (error: any) {
      console.log('Erro completo:', error.response?.data);

      const errorData =
        error.response?.data?.errors ||
        error.response?.data?.message;

      const message = Array.isArray(errorData)
        ? errorData.join(', ')
        : errorData || 'Erro ao criar conta.';

      showToast(message, 'error');
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

            <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
              CAMPUS SYSTEMS
            </Text>

            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Criar conta
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Faça parte do MANTIS Campus Systems.
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
              Nome completo
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
              placeholder="Ex: João da Silva"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />

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
              placeholder="Ex: joao@ufsc.br"
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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Tipo de perfil
            </Text>

            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colors.backgroundDeep,
                  borderColor: colors.border,
                },
              ]}
            >
              <Picker
                selectedValue={role}
                onValueChange={value => setRole(value)}
                style={{ color: colors.textPrimary }}
                dropdownIconColor={colors.textPrimary}
              >
                <Picker.Item
                  label="Solicitante (Aluno/Professor)"
                  value="requester"
                  color={colors.textPrimary}
                />

                <Picker.Item
                  label="Técnico (Suporte)"
                  value="technician"
                  color={colors.textPrimary}
                />
              </Picker>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRegister}
              disabled={submitting}
              style={styles.buttonContainer}
            >
              <View
                style={[
                  styles.button,
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
                      styles.buttonText,
                      { color: colors.background },
                    ]}
                  >
                    Criar conta
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
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={[styles.backText, { color: colors.textSecondary }]}>
                Já tem uma conta?{' '}
                <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>
                  Voltar para o Login
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
  },

  brandSubtitle: {
    fontSize: 11,
    letterSpacing: 4,
    marginTop: SPACING.xs,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: SPACING.xl,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.sm,
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

  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },

  buttonContainer: {
    marginTop: SPACING.sm,
  },

  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  divider: {
    height: 1,
    marginVertical: SPACING.lg,
  },

  backButton: {
    alignItems: 'center',
  },

  backText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
