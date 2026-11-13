// mobile/src/screens/Home.tsx
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Efeito de vidro
import { COLORS, SPACING } from '../theme';
import XmbBackground from '../components/XmbBackground';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

export default function Home({ navigation }: any) {
  const [activeCategory, setActiveCategory] = useState('tickets');
  const { signOut, user } = useContext(AuthContext);
  const { isDark, toggleTheme, colors } = useContext(ThemeContext);

  const CATEGORIES = [
    { id: 'home', label: 'Início', icon: 'home' },
    { id: 'tickets', label: 'Chamados', icon: 'layers' },
    { id: 'profile', label: 'Perfil', icon: 'user' },
    { id: 'settings', label: 'Config', icon: 'settings' },
  ];

  const getMenus = () => ({
    home: [
      { id: 'dashboard', label: 'Painel de Métricas', icon: 'activity', role: 'manager' },
      { id: 'manage_categories', label: 'Categorias', icon: 'grid', role: 'manager' },
      { id: 'recent', label: 'Atividade Recente', icon: 'clock', role: 'all' },
    ],
    tickets: [
      { id: 'my_tickets', label: 'Ver Chamados', icon: 'file-text', role: 'all' },
      { id: 'new_ticket', label: 'Criar Solicitação', icon: 'plus-circle', role: 'requester' },
    ],
    profile: [
      { id: 'my_profile', label: 'Meu Perfil', icon: 'user', role: 'all' },
    ],
    settings: [
      { id: 'toggle_theme', label: isDark ? 'Tema Claro' : 'Tema Escuro', icon: isDark ? 'sun' : 'moon', role: 'all' },
      { id: 'logout', label: 'Sair da Conta', icon: 'log-out', role: 'all' },
    ]
  });

  const handleMenuPress = (menuId: string) => {
    switch (menuId) {
      case 'dashboard': navigation.navigate('Dashboard'); break;
      case 'manage_categories': navigation.navigate('ManageCategories'); break;
      case 'my_tickets': navigation.navigate('MyTickets'); break;
      case 'new_ticket': navigation.navigate('NewTicket'); break;
      case 'my_profile': navigation.navigate('Profile'); break;
      case 'toggle_theme': toggleTheme(); break; // <-- Alterna o tema
      case 'logout': signOut(); break;
      default: break;
    }
  };

  const currentMenus = getMenus()[activeCategory as keyof ReturnType<typeof getMenus>] || [];

  return (
    <XmbBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.textPrimary }]}>MANTIS</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>CAMPUS SYSTEMS</Text>
        </View>

        {/* Navegação Horizontal */}
        <View style={styles.horizontalNavContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalNav}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <Feather name={cat.icon as any} size={28} color={isActive ? colors.textPrimary : colors.textMuted} />
                  <Text style={[styles.categoryLabel, { color: isActive ? colors.textPrimary : colors.textMuted, fontWeight: isActive ? 'bold' : 'normal' }]}>
                    {cat.label}
                  </Text>
                  {/* Indicador de seleção (Luz XMB) */}
                  {isActive && <View style={[styles.activeIndicator, { backgroundColor: colors.accentSilver }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Navegação Vertical com Vidro */}
        <View style={styles.verticalNavContainer}>
          <ScrollView contentContainerStyle={styles.verticalNav}>
            {currentMenus.map((item: any, index: number) => {
              if (item.role !== 'all' && item.role !== user?.role) return null;
              const isSelected = index === 0; 

              return (
                <TouchableOpacity key={item.id} onPress={() => handleMenuPress(item.id)}>
                  <View style={styles.menuItemWrapper}>
                    {/* O Efeito de Vidro acontece aqui */}
                    {isSelected && (
                      <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    )}
                    
                    <View style={[styles.menuItem, isSelected && { backgroundColor: colors.glassTint }]}>
                      <View style={styles.menuIconContainer}>
                        <Feather name={item.icon as any} size={20} color={isSelected ? colors.accentSilver : colors.textSecondary} />
                      </View>
                      <Text style={[styles.menuLabel, { color: isSelected ? colors.textPrimary : colors.textSecondary }]}>
                        {item.label}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  logo: { fontSize: 24, fontWeight: '300', letterSpacing: 8 },
  subtitle: { fontSize: 10, letterSpacing: 4, marginTop: 2 },
  horizontalNavContainer: { height: 100, justifyContent: 'center' },
  horizontalNav: { paddingHorizontal: SPACING.lg, alignItems: 'center' },
  categoryItem: { alignItems: 'center', justifyContent: 'center', marginRight: 32, paddingVertical: 10 },
  categoryLabel: { marginTop: 8, fontSize: 12 },
  activeIndicator: { width: 4, height: 4, borderRadius: 2, marginTop: 6, shadowColor: '#fff', shadowOpacity: 0.8, shadowRadius: 4 },
  verticalNavContainer: { flex: 1 },
  verticalNav: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  menuItemWrapper: { marginVertical: 4, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  menuIconContainer: { width: 36, alignItems: 'flex-start' },
  menuLabel: { fontSize: 16, fontWeight: '500' },
});