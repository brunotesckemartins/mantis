// mobile/src/screens/Home.tsx
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SPACING } from '../theme';
import XmbBackground from '../components/XmbBackground';
import GlassCard from '../components/GlassCard';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../api/client';

export default function Home({ navigation }: any) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { isDark, colors } = useContext(ThemeContext);

  useEffect(() => {
    api.get('/api/v1/tickets').then(res => { setTickets(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const myAssignedTickets = tickets.filter(t => t.technician?.id === user?.id && t.status === 'em_atendimento');
  const openQueueTickets = tickets.filter(t => t.status === 'aberto');

  const QuickAction = ({ icon, label, onPress }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={styles.quickActionBlur}>
        <Feather name={icon} size={24} color={colors.accentSilver} />
      </BlurView>
      <Text style={[styles.quickActionLabel, { color: colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );

  // Função para pegar a cor do status (Padrão do app)
  const getStatusColor = (status: string) => {
    if (status === 'aberto') return colors.statusWarning;
    if (status === 'em_atendimento') return colors.statusInfo;
    if (status === 'resolvido') return colors.statusSuccess;
    return colors.textPrimary;
  };

  const TicketCard = ({ item }: { item: any }) => (
    <GlassCard onPress={() => navigation.navigate('TicketDetails', { ticket: item, userRole: user?.role })}>
      <View style={styles.ticketContent}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.ticketTitle, { color: colors.textPrimary }]}>{item.title}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {/* ETIQUETA COLORIDA PADRONIZADA */}
            <View style={[styles.badge, { backgroundColor: `${getStatusColor(item.status)}20`, borderColor: `${getStatusColor(item.status)}40` }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 10 }}>{item.requester?.name}</Text>
          </View>

        </View>
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </GlassCard>
  );

  return (
    <XmbBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>Olá,</Text>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={styles.avatarBlur}>
              <Feather name="user" size={20} color={colors.accentSilver} />
            </BlurView>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.quickActionsContainer}>
            <QuickAction icon="plus-circle" label="Novo Chamado" onPress={() => navigation.navigate('NewTicket')} />
            {user?.role === 'manager' && <QuickAction icon="activity" label="Painel" onPress={() => navigation.navigate('Dashboard')} />}
            {user?.role === 'manager' && <QuickAction icon="grid" label="Categorias" onPress={() => navigation.navigate('ManageCategories')} />}
            <QuickAction icon="book-open" label="Setores" onPress={() => navigation.navigate('Academic')} />
            <QuickAction icon="help-circle" label="Ajuda" onPress={() => navigation.navigate('Faq')} />
          </View>

          {loading ? (
             <ActivityIndicator size="large" color={colors.accentSilver} style={{ marginTop: 50 }} />
          ) : (
            <>
              {user?.role === 'technician' && (
                <>
                  <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Minha Fila (Atribuídos)</Text></View>
                  {myAssignedTickets.length > 0 ? myAssignedTickets.map(t => <TicketCard key={t.id} item={t} />) : <Text style={{ color: colors.textMuted, marginLeft: 10, marginBottom: 20 }}>Nenhum chamado em atendimento.</Text>}

                  <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Chamados Abertos</Text></View>
                  {openQueueTickets.length > 0 ? openQueueTickets.map(t => <TicketCard key={t.id} item={t} />) : <Text style={{ color: colors.textMuted, marginLeft: 10, marginBottom: 20 }}>Nenhum chamado na fila.</Text>}
                </>
              )}

              {user?.role !== 'technician' && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Atividade Recente</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Tickets')}>
                      <Text style={[styles.seeAll, { color: colors.accentSilver }]}>Ver todos</Text>
                    </TouchableOpacity>
                  </View>
                  {tickets.slice(0, 5).map(t => <TicketCard key={t.id} item={t} />)}
                </>
              )}
            </>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  greeting: { fontSize: 16, marginBottom: 4 },
  userName: { fontSize: 28, fontWeight: 'bold', letterSpacing: -0.5 },
  avatarBlur: { width: 45, height: 45, borderRadius: 22.5, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scrollContent: { paddingHorizontal: SPACING.lg },
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: SPACING.md, marginBottom: SPACING.xl },
  quickAction: { alignItems: 'center', minWidth: 70, marginBottom: 15 },
  quickActionBlur: { width: 60, height: 60, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  quickActionLabel: { fontSize: 12, textAlign: 'center', fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.sm },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  ticketContent: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  ticketTitle: { fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
});