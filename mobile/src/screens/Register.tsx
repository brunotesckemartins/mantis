// mobile/src/screens/Register.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import api from '../api/client';
import XmbBackground from '../components/XmbBackground';

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

    // validacoes basicas antes de bater na api
    if (!cleanName || !cleanEmail || !password) {
      return showToast('Preencha todos os campos.', 'error');
    }
    if (!cleanEmail.includes('@')) {
      return showToast('Informe um e-mail válido.', 'error');
    }
    if (password.length < 6) {
      return showToast('A senha precisa ter no mínimo 6 caracteres.', 'error');
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      // Rota correta para criação de usuário no Devise API
      await api.post('/auth', {
        user: {
          name: cleanName,
          email: cleanEmail,
          password,
          password_confirmation: password,
          role
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      showToast('Conta criada com sucesso! Faça login.', 'success');
      navigation.goBack();
    } catch (error: any) {
      console.log("Erro completo:", error.response?.data);
      const errorData = error.response?.data?.errors || error.response?.data?.message;
      const msg = Array.isArray(errorData) ? errorData.join(', ') : (errorData || 'Erro ao criar conta.');
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <XmbBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Criar Conta</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Junte-se ao Mantis Campus Systems</Text>

        <Text style={[styles.label, { color: colors.textPrimary }]}>Nome Completo</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Ex: João da Silva"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.textPrimary }]}>E-mail</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Ex: joao@ufsc.br"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, { color: colors.textPrimary }]}>Senha</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={[styles.label, { color: colors.textPrimary }]}>Tipo de Perfil</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Picker
            selectedValue={role}
            onValueChange={(val) => setRole(val)}
            style={{ color: colors.textPrimary }}
            dropdownIconColor={colors.textPrimary}
          >
            <Picker.Item label="Solicitante (Aluno/Professor)" value="requester" color={colors.textPrimary} />
            <Picker.Item label="Técnico (Suporte)" value="technician" color={colors.textPrimary} />
          </Picker>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver, opacity: submitting ? 0.6 : 1 }]} onPress={handleRegister} disabled={submitting}>
          <Text style={[styles.buttonText, { color: colors.background }]}>{submitting ? 'Cadastrando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: colors.accentSilver }]}>Já tenho uma conta. Voltar para o Login.</Text>
        </TouchableOpacity>
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '300', letterSpacing: 2, textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 10 },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
  backButton: { marginTop: 20, alignItems: 'center' },
  backText: { fontSize: 14 }
});