// mobile/src/screens/Settings.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function Settings() {
  const { signOut } = useContext(AuthContext);
  const { isDark, toggleTheme, colors } = useContext(ThemeContext);

  // O Alert.alert não funciona bem na Web com múltiplos botões,
  // então chamamos o signOut diretamente.
  const handleLogout = () => {
    signOut();
  };

  return (
    <XmbBackground>
      <SafeAreaView style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Configurações</Text>

        <TouchableOpacity style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={toggleTheme}>
          <Feather name={isDark ? 'sun' : 'moon'} size={20} color={colors.textPrimary} />
          <Text style={[styles.optionText, { color: colors.textPrimary }]}>Mudar para Tema {isDark ? 'Claro' : 'Escuro'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.option, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.statusDanger} />
          <Text style={[styles.optionText, { color: colors.statusDanger }]}>Sair da Conta</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, marginTop: 20 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1 },
  optionText: { fontSize: 16, fontWeight: '600', marginLeft: 15 },
});