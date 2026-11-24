// mobile/src/screens/Home.tsx
import React, { useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SPACING } from '../theme';
import XmbBackground from '../components/XmbBackground';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../api/client';

export default function Home({ navigation }: any) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const { isDark, colors } = useContext(ThemeContext);

  // carrega chamados e atualiza sempre que voltar pra home
  const loadTickets = async () => {
    try {
      const res = await api.get('/api/v1/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadTickets(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

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

  const TicketCard = ({ item }: { item: any }) => (
    <GlassCard onPress={() => navigation.navigate('TicketDetails', { ticket: item, userRole: user?.role })}>
      <View style={styles.ticketContent}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.ticketTitle, { color: colors.textPrimary }]}>{item.title}</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <StatusBadge status={item.status} />
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
            {/* evita quebra caso o nome venha vazio */}
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name?.split(' ')[0] || 'Usuário'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <BlurView intensity={isDark ? 30 : 60} tint={isDark ? 'dark' : 'light'} style={styles.avatarBlur}>
              <Feather name="user" size={20} color={colors.accentSilver} />
            </BlurView>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentSilver} />}
        >
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
                  {tickets.length > 0 ? tickets.slice(0, 5).map(t => <TicketCard key={t.id} item={t} />) : (
                    <Text style={{ color: colors.textMuted, marginLeft: 10 }}>Nenhum chamado recente.</Text>
                  )}
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
});