
import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import { SPACING } from '../theme';

export default function Settings() {
  const { signOut } = useContext(AuthContext);
  const { isDark, toggleTheme, colors } = useContext(ThemeContext);

  const handleLogout = () => {
    signOut();
  };

  return (
    <XmbBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Configurações
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Personalize sua experiência no MANTIS.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          APARÊNCIA
        </Text>

        <TouchableOpacity
          style={[
            styles.option,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.glassTint },
            ]}
          >
            <Feather
              name={isDark ? 'sun' : 'moon'}
              size={21}
              color={colors.accentSilver}
            />
          </View>

          <View style={styles.optionContent}>
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
              Tema {isDark ? 'Claro' : 'Escuro'}
            </Text>

            <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
              Mudar para o tema {isDark ? 'claro' : 'escuro'}.
            </Text>
          </View>

          <Feather
            name="chevron-right"
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          CONTA
        </Text>

        <TouchableOpacity
          style={[
            styles.option,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: 'rgba(224, 108, 117, 0.12)' },
            ]}
          >
            <Feather
              name="log-out"
              size={21}
              color={colors.statusDanger}
            />
          </View>

          <View style={styles.optionContent}>
            <Text style={[styles.optionText, { color: colors.statusDanger }]}>
              Sair da conta
            </Text>

            <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
              Encerrar sua sessão no aplicativo.
            </Text>
          </View>

          <Feather
            name="chevron-right"
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerTitle, { color: colors.textMuted }]}>
            MANTIS
          </Text>

          <Text style={[styles.footerSubtitle, { color: colors.textMuted }]}>
            CAMPUS SYSTEMS
          </Text>
        </View>
      </SafeAreaView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },

  header: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 14,
    marginTop: SPACING.sm,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SPACING.borderRadius,
    marginBottom: SPACING.md,
    borderWidth: 1,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },

  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },

  optionDescription: {
    fontSize: 12,
    marginTop: SPACING.xs,
  },

  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },

  footerTitle: {
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 6,
  },

  footerSubtitle: {
    fontSize: 9,
    letterSpacing: 3,
    marginTop: SPACING.xs,
  },
});
