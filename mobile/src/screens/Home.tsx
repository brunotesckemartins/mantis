// mobile/src/screens/Home.tsx
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SPACING } from '../theme';
import XmbBackground from '../components/XmbBackground';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../api/client';

export default function Home({ navigation }: any) {
  const [activeCategory, setActiveCategory] = useState('home');
  const [recentTickets, setRecentTickets] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const { signOut, user } = useContext(AuthContext);
  const { isDark, toggleTheme, colors } = useContext(ThemeContext);

  useEffect(() => {
    // Busca os últimos chamados de forma segura
    api.get('/api/v1/tickets')
      .then(res => setRecentTickets(res.data.slice(0, 3)))
      .catch(err => console.log("Erro ao buscar recentes:", err));
  }, []);

  // Menu Horizontal (Agora com o Perfil de volta!)
  const CATEGORIES = [
    { id: 'home', label: 'Início', icon: 'home' },
    { id: 'tickets', label: 'Chamados', icon: 'layers' },
    { id: 'academic', label: 'Acadêmico', icon: 'book-open' },
    { id: 'profile', label: 'Perfil', icon: 'user' }, // <-- AQUI ESTÁ O PERFIL
    { id: 'faq', label: 'Ajuda', icon: 'help-circle' },
    { id: 'settings', label: 'Config', icon: 'settings' },
  ];

  const getMenus = () => ({
    home: [
      { id: 'dashboard', label: 'Painel de Métricas', icon: 'activity', role: 'manager' },
      { id: 'manage_categories', label: 'Gerenciar Categorias', icon: 'grid', role: 'manager' },
      { id: 'toggle_recent', label: showRecent ? 'Ocultar Atividade Recente' : 'Ver Atividade Recente', icon: 'clock', role: 'all' },
    ],
    tickets: [
      { id: 'my_tickets', label: 'Ver Meus Chamados', icon: 'file-text', role: 'all' },
      { id: 'new_ticket', label: 'Criar Solicitação', icon: 'plus-circle', role: 'requester' },
    ],
    academic: [
      { id: 'sectors', label: 'Setores e Blocos', icon: 'map-pin', role: 'all' },
    ],
    profile: [
      { id: 'my_profile', label: 'Meu Perfil', icon: 'user', role: 'all' },
    ],
    faq: [
      { id: 'faq_screen', label: 'Dúvidas Frequentes', icon: 'help-circle', role: 'all' },
    ],
    settings: [
      { id: 'toggle_theme', label: isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro', icon: isDark ? 'sun' : 'moon', role: 'all' },
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
      case 'faq_screen': navigation.navigate('Faq'); break;
      case 'sectors': navigation.navigate('Sectors'); break;
      case 'toggle_theme': toggleTheme(); break;
      case 'toggle_recent': setShowRecent(!showRecent); break;
      case 'logout': 
        Alert.alert('Sair', 'Deseja realmente sair da conta?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', onPress: signOut, style: 'destructive' }
        ]);
        break;
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

        <View style={styles.horizontalNavContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalNav}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => setActiveCategory(cat.id)}>
                  <Feather name={cat.icon as any} size={28} color={isActive ? colors.textPrimary : colors.textMuted} />
                  <Text style={[styles.categoryLabel, { color: isActive ? colors.textPrimary : colors.textMuted, fontWeight: isActive ? 'bold' : 'normal' }]}>
                    {cat.label}
                  </Text>
                  {isActive && <View style={[styles.activeIndicator, { backgroundColor: colors.accentSilver }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.verticalNavContainer}>
          <ScrollView contentContainerStyle={styles.verticalNav}>
            {currentMenus.map((item: any, index: number) => {
              if (item.role !== 'all' && item.role !== user?.role) return null;
              const isSelected = index === 0; 

              return (
                <TouchableOpacity key={item.id} onPress={() => handleMenuPress(item.id)}>
                  <View style={styles.menuItemWrapper}>
                    {isSelected && <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />}
                    <View style={[styles.menuItem, isSelected && { backgroundColor: colors.glassTint }]}>
                      <View style={styles.menuIconContainer}>
                        <Feather name={item.icon as any} size={20} color={isSelected ? colors.accentSilver : colors.textSecondary} />
                      </View>
                      <Text style={[styles.menuLabel, { color: isSelected ? colors.textPrimary : colors.textSecondary }]}>{item.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* ATIVIDADE RECENTE EXPANSÍVEL */}
            {activeCategory === 'home' && showRecent && (
              <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 15 }}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Atividade Recente</Text>
                {recentTickets.map((t: any) => (
                  <TouchableOpacity 
                    key={t.id} 
                    style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => navigation.navigate('TicketDetails', { ticket: t, userRole: user?.role })}
                  >
                    <Text style={[styles.recentTitle, { color: colors.textPrimary }]}>{t.title}</Text>
                    <Text style={[styles.recentStatus, { color: colors.accentSilver }]}>{t.status.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
                {recentTickets.length === 0 && <Text style={{ color: colors.textMuted }}>Nenhuma atividade recente.</Text>}
              </View>
            )}
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
  categoryItem: { alignItems: 'center', justifyContent: 'center', marginRight: 28, paddingVertical: 10 },
  categoryLabel: { marginTop: 8, fontSize: 12 },
  activeIndicator: { width: 4, height: 4, borderRadius: 2, marginTop: 6, shadowColor: '#fff', shadowOpacity: 0.8, shadowRadius: 4 },
  verticalNavContainer: { flex: 1 },
  verticalNav: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 50 },
  menuItemWrapper: { marginVertical: 4, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16 },
  menuIconContainer: { width: 36, alignItems: 'flex-start' },
  menuLabel: { fontSize: 16, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  recentCard: { padding: 15, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
  recentTitle: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
  recentStatus: { fontSize: 12, fontWeight: 'bold' },
});