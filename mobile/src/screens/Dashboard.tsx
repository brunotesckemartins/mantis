// mobile/src/screens/Dashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import { SPACING } from '../theme';
import { getPriorityColor, getPriorityLabel, formatDate } from '../utils/ticketStatus';

const PRIORITIES = ['critica', 'alta', 'media', 'baixa'];

// horas desde a abertura, em texto curto (ex.: "3h", "2d")
function ageLabel(iso: string) {
  const hours = Math.max(0, (Date.now() - new Date(iso).getTime()) / 36e5);
  if (hours < 24) return `${Math.floor(hours)}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function Dashboard({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { colors, isDark } = useContext(ThemeContext);

  // busca metricas do painel e evita tela travada se der erro na api
  async function loadDashboard() {
    try {
      setError(false);
      // métricas consolidadas vêm do backend; a lista serve para os recortes extras
      const [response, ticketsRes] = await Promise.all([
        api.get('/api/v1/dashboard'),
        api.get('/api/v1/tickets').catch(() => null),
      ]);
      setData(response.data);
      if (ticketsRes) setTickets(ticketsRes.data);
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <XmbBackground>
        <ActivityIndicator size="large" color={colors.accentSilver} style={{ marginTop: 60 }} />
      </XmbBackground>
    );
  }

  if (error || !data) {
    return (
      <XmbBackground>
        <View style={{ alignItems: 'center', marginTop: 60, padding: 20 }}>
          <Text style={{ color: colors.statusDanger, marginBottom: 15 }}>Erro ao carregar métricas.</Text>
          <TouchableOpacity onPress={loadDashboard} style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </XmbBackground>
    );
  }

  const renderCard = (title: string, value: string | number, color: string) => (
    <View style={styles.cardWrapper}>
      <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[styles.card, { backgroundColor: colors.glassTint, borderColor: colors.border }]}>
        <Text style={[styles.cardNumber, { color }]}>{value}</Text>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={[styles.rankingWrapper, { borderColor: colors.border, marginBottom: SPACING.md }]}>
      <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[styles.rankingBox, { backgroundColor: colors.glassTint }]}>
        <Text style={[styles.rankingTitle, { color: colors.textPrimary }]}>{title}</Text>
        {children}
      </View>
    </View>
  );

  const renderBar = (label: string, value: number, max: number, color: string, key: string) => (
    <View key={key} style={{ marginBottom: SPACING.sm }}>
      <View style={styles.barHeader}>
        <Text style={{ color: colors.textSecondary, fontSize: 14 }} numberOfLines={1}>{label}</Text>
        <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{value}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.barFill, { backgroundColor: color, width: `${max > 0 ? (value / max) * 100 : 0}%` }]} />
      </View>
    </View>
  );

  // recortes calculados a partir da lista de chamados
  const resolutionRate = data.total > 0 ? Math.round((data.resolvidos / data.total) * 100) : 0;
  const pending = tickets.filter(t => t.status !== 'resolvido');
  const pendingByPriority = PRIORITIES.map(p => ({ priority: p, count: pending.filter(t => t.priority === p).length }));
  const maxPriority = Math.max(1, ...pendingByPriority.map(p => p.count));

  const categoryCounts: Record<string, number> = {};
  tickets.forEach(t => {
    const name = t.category?.name || 'Sem categoria';
    categoryCounts[name] = (categoryCounts[name] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCategory = Math.max(1, ...topCategories.map(([, c]) => c));

  // chamados sem técnico esperando há mais tempo
  const oldestWaiting = tickets
    .filter(t => t.status === 'aberto' && !t.technician)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 3);

  return (
    <XmbBackground>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} tintColor={colors.accentSilver} />}
      >
        <View style={styles.grid}>
          {renderCard('Total de Chamados', data.total, colors.textPrimary)}
          {renderCard('Abertos', data.abertos, colors.statusInfo)}
          {renderCard('Em Atendimento', data.em_atendimento, colors.statusWarning)}
          {renderCard('Resolvidos', data.resolvidos, colors.statusSuccess)}
        </View>

        {/* tempo medio de atendimento retornado pelo backend */}
        <View style={[styles.rankingWrapper, { borderColor: colors.border, marginBottom: SPACING.md }]}>
          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[styles.rankingBox, { backgroundColor: colors.glassTint }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Tempo Médio de Atendimento (TMA)</Text>
            <Text style={[styles.cardNumber, { color: colors.accentSilver, marginBottom: 0 }]}>{data.tempo_medio_horas ?? 0}h</Text>
          </View>
        </View>

        {renderSection('Taxa de Resolução', (
          <>
            <Text style={[styles.cardNumber, { color: colors.statusSuccess }]}>{resolutionRate}%</Text>
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.barFill, { backgroundColor: colors.statusSuccess, width: `${resolutionRate}%` }]} />
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>{data.resolvidos} de {data.total} chamados resolvidos</Text>
          </>
        ))}

        {tickets.length > 0 && renderSection('Pendentes por Prioridade', (
          pending.length > 0
            ? pendingByPriority.map(p => renderBar(getPriorityLabel(p.priority), p.count, maxPriority, getPriorityColor(p.priority, colors), p.priority))
            : <Text style={{ color: colors.textMuted }}>Nenhum chamado pendente. 🎉</Text>
        ))}

        {tickets.length > 0 && renderSection('Chamados por Categoria', (
          topCategories.map(([name, count]) => renderBar(name, count, maxCategory, colors.accentSilver, name))
        ))}

        {oldestWaiting.length > 0 && renderSection('Aguardando Técnico há mais tempo', (
          oldestWaiting.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.rankingItem, { borderBottomColor: colors.border }]}
              onPress={() => navigation?.navigate('TicketDetails', { ticket: t, userRole: 'manager' })}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 15 }} numberOfLines={1}>{t.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{t.code || `#${t.id}`} · {formatDate(t.created_at)}</Text>
              </View>
              <Text style={{ color: colors.statusWarning, fontWeight: 'bold' }}>{ageLabel(t.created_at)}</Text>
            </TouchableOpacity>
          ))
        ))}

        <View style={[styles.rankingWrapper, { borderColor: colors.border }]}>
          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[styles.rankingBox, { backgroundColor: colors.glassTint }]}>
            <Text style={[styles.rankingTitle, { color: colors.textPrimary }]}>🏆 Ranking de Técnicos</Text>
            
            {data.ranking?.length > 0 ? data.ranking.map((tech: any, index: number) => (
              <View key={index} style={[styles.rankingItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.rankingName, { color: colors.textPrimary }]}>{index + 1}º {tech.name}</Text>
                <Text style={[styles.rankingCount, { color: colors.statusSuccess }]}>{tech.resolved_count}</Text>
              </View>
            )) : (
              <Text style={{ color: colors.textMuted }}>Nenhum técnico com chamados resolvidos.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', borderRadius: 12, marginBottom: SPACING.md, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  card: { padding: SPACING.lg, borderWidth: 1 },
  cardNumber: { fontSize: 32, fontWeight: '300', marginBottom: 5 },
  cardLabel: { fontSize: 14, fontWeight: '500' },
  rankingWrapper: { borderRadius: 12, marginTop: SPACING.sm, marginBottom: 50, overflow: 'hidden', borderWidth: 1 },
  rankingBox: { padding: SPACING.lg },
  rankingTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING.md },
  rankingItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  rankingName: { fontSize: 16, fontWeight: '400' },
  rankingCount: { fontSize: 16, fontWeight: 'bold' },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 }
});