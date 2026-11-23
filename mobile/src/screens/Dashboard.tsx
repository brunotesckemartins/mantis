// mobile/src/screens/Dashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import { SPACING } from '../theme';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { colors, isDark } = useContext(ThemeContext);

  // busca metricas do painel e evita tela travada se der erro na api
  async function loadDashboard() {
    try {
      setError(false);
      const response = await api.get('/api/v1/dashboard');
      setData(response.data);
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
  rankingCount: { fontSize: 16, fontWeight: 'bold' }
});