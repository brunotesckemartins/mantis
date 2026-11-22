// mobile/src/screens/Login.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function Login({ navigation }: any) {
  const { signIn } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setErrorMsg('');
    // remove espacos extras do teclado no celular
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
      setErrorMsg(error.message || 'Erro ao tentar logar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <XmbBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.logo, { color: colors.textPrimary }]}>MANTIS</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>CAMPUS SYSTEMS</Text>
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="E-mail"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Senha"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {errorMsg ? <Text style={[styles.errorText, { color: colors.statusDanger }]}>{errorMsg}</Text> : null}

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver, opacity: submitting ? 0.6 : 1 }]} onPress={handleLogin} disabled={submitting}>
            <Text style={[styles.buttonText, { color: colors.background }]}>{submitting ? 'Entrando...' : 'Entrar'}</Text>
          </TouchableOpacity>

          {/* NOVO BOTÃO DE CADASTRO */}
          <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerText, { color: colors.accentSilver }]}>Não tem uma conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logo: { fontSize: 32, fontWeight: '300', letterSpacing: 10, textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 12, letterSpacing: 4, textAlign: 'center', marginBottom: 50 },
  form: { width: '100%' },
  input: { borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16 },
  errorText: { marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
  registerButton: { marginTop: 20, alignItems: 'center' },
  registerText: { fontSize: 15, fontWeight: '500' }
});