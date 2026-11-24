
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';

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
  const [rolePickerVisible, setRolePickerVisible] = useState(false);

  const roles = [
    {
      label: 'Solicitante (Aluno/Professor)',
      value: 'requester',
    },
    {
      label: 'Técnico (Suporte)',
      value: 'technician',
    },
  ];

  const selectedRole = roles.find(item => item.value === role);

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

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRolePickerVisible(true)}
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colors.backgroundDeep,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.pickerText,
                  { color: colors.textPrimary },
                ]}
              >
                {selectedRole?.label}
              </Text>

              <Text
                style={[
                  styles.pickerArrow,
                  { color: colors.textSecondary },
                ]}
              >
                ▾
              </Text>
            </TouchableOpacity>

            <Modal
              visible={rolePickerVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setRolePickerVisible(false)}
              statusBarTranslucent
            >
              <View style={styles.modalOverlay}>
                <TouchableOpacity
                  style={styles.modalBackdrop}
                  activeOpacity={1}
                  onPress={() => setRolePickerVisible(false)}
                />

                <View
                  style={[
                    styles.modalContent,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Escolha o tipo de perfil
                  </Text>

                  {roles.map(item => {
                    const isSelected = role === item.value;

                    return (
                      <Pressable
                        key={item.value}
                        onPress={() => {
                          setRole(item.value);
                          setRolePickerVisible(false);
                        }}
                        style={({ pressed }) => [
                          styles.roleOption,
                          {
                            backgroundColor: isSelected
                              ? colors.glassTint
                              : 'transparent',
                            borderColor: isSelected
                              ? colors.accentSilver
                              : colors.border,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleOptionText,
                            {
                              color: colors.textPrimary,
                              fontWeight: isSelected ? '700' : '400',
                            },
                          ]}
                        >
                          {item.label}
                        </Text>

                        {isSelected && (
                          <Text
                            style={[
                              styles.checkmark,
                              { color: colors.accentSilver },
                            ]}
                          >
                            ✓
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}

                  <TouchableOpacity
                    onPress={() => setRolePickerVisible(false)}
                    style={styles.modalCloseButton}
                  >
                    <Text
                      style={[
                        styles.modalCloseText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

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
              <Text
                style={[
                  styles.backText,
                  { color: colors.textSecondary },
                ]}
              >
                Já tem uma conta?{' '}
                <Text
                  style={{
                    color: colors.accentSilver,
                    fontWeight: 'bold',
                  }}
                >
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
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pickerText: {
    fontSize: 16,
    flex: 1,
  },

  pickerArrow: {
    fontSize: 20,
    marginLeft: SPACING.sm,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },

  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },

  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    padding: SPACING.lg,
    elevation: 12,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },

  roleOption: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  roleOptionText: {
    fontSize: 15,
    flex: 1,
  },

  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },

  modalCloseButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.xs,
  },

  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
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
