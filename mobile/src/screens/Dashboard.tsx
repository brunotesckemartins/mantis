// mobile/src/screens/Dashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import { SPACING } from '../theme';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const { colors, isDark } = useContext(ThemeContext);

  useEffect(() => {
    api.get('/api/v1/dashboard')
      .then(response => setData(response.data))
      .catch(err => console.error('Erro ao buscar dashboard:', err));
  }, []);

  if (!data) return <XmbBackground><Text style={{ textAlign: 'center', marginTop: 50, color: colors.textPrimary }}>Carregando métricas...</Text></XmbBackground>;

  const renderCard = (title: string, value: number, color: string) => (
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
      <ScrollView style={styles.container}>
        <View style={styles.grid}>
          {renderCard('Total de Chamados', data.total, colors.textPrimary)}
          {renderCard('Abertos', data.abertos, colors.statusInfo)}
          {renderCard('Em Atendimento', data.em_atendimento, colors.statusWarning)}
          {renderCard('Resolvidos', data.resolvidos, colors.statusSuccess)}
        </View>

        <View style={[styles.rankingWrapper, { borderColor: colors.border }]}>
          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[styles.rankingBox, { backgroundColor: colors.glassTint }]}>
            <Text style={[styles.rankingTitle, { color: colors.textPrimary }]}>🏆 Ranking de Técnicos</Text>
            
            {data.ranking.map((tech: any, index: number) => (
              <View key={index} style={[styles.rankingItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.rankingName, { color: colors.textPrimary }]}>{index + 1}º {tech.name}</Text>
                <Text style={[styles.rankingCount, { color: colors.statusSuccess }]}>{tech.resolved_count}</Text>
              </View>
            ))}
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