// mobile/src/screens/Login.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function Login() {
  const { signIn } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin() {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Preencha e-mail e senha.');
      return;
    }
    try {
      await signIn(email, password);
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao tentar logar.');
    }
  }

  return (
    <XmbBackground>
      <View style={styles.container}>
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

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver }]} onPress={handleLogin}>
            <Text style={[styles.buttonText, { color: colors.background }]}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { fontSize: 32, fontWeight: '300', letterSpacing: 10, textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 12, letterSpacing: 4, textAlign: 'center', marginBottom: 50 },
  form: { width: '100%' },
  input: { borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16 },
  errorText: { marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
});