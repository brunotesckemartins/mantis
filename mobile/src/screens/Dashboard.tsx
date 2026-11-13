// mobile/src/screens/Dashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const { colors, isDark } = useContext(ThemeContext);

  useEffect(() => {
    api.get('/api/v1/dashboard')
      .then(response => setData(response.data))
      .catch(err => console.error('Erro ao buscar dashboard:', err));
  }, []);

  if (!data) {
    return (
      <XmbBackground>
        <Text style={{ textAlign: 'center', marginTop: 50, color: colors.textPrimary }}>Carregando métricas...</Text>
      </XmbBackground>
    );
  }

  return (
    <XmbBackground>
      <ScrollView style={styles.container}>
        <View style={styles.grid}>
          {/* Cartão Total */}
          <View style={styles.cardWrapper}>
            <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[styles.card, { backgroundColor: colors.glassTint }]}>
              <Text style={[styles.cardNumber, { color: colors.textPrimary }]}>{data.total}</Text>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Total de Chamados</Text>
            </View>
          </View>

          {/* Cartão Abertos */}
          <View style={styles.cardWrapper}>
            <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[styles.card, { backgroundColor: colors.glassTint }]}>
              <Text style={[styles.cardNumber, { color: '#FF9F0A' }]}>{data.abertos}</Text>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Abertos</Text>
            </View>
          </View>

          {/* Cartão Em Atendimento */}
          <View style={styles.cardWrapper}>
            <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[styles.card, { backgroundColor: colors.glassTint }]}>
              <Text style={[styles.cardNumber, { color: '#BF5AF2' }]}>{data.em_atendimento}</Text>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Em Atendimento</Text>
            </View>
          </View>

          {/* Cartão Resolvidos */}
          <View style={styles.cardWrapper}>
            <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={[styles.card, { backgroundColor: colors.glassTint }]}>
              <Text style={[styles.cardNumber, { color: '#30D158' }]}>{data.resolvidos}</Text>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Resolvidos</Text>
            </View>
          </View>
        </View>

        <View style={styles.rankingWrapper}>
          <BlurView intensity={isDark ? 20 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[styles.rankingBox, { backgroundColor: colors.glassTint }]}>
            <Text style={[styles.rankingTitle, { color: colors.textPrimary }]}>🏆 Ranking de Técnicos</Text>
            <Text style={[styles.rankingSubtitle, { color: colors.textSecondary }]}>Chamados resolvidos</Text>

            {data.ranking.map((tech: any, index: number) => (
              <View key={index} style={[styles.rankingItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.rankingName, { color: colors.textPrimary }]}>{index + 1}º {tech.name}</Text>
                <Text style={[styles.rankingCount, { color: '#30D158' }]}>{tech.resolved_count}</Text>
              </View>
            ))}
            
            {data.ranking.length === 0 && <Text style={{ color: colors.textMuted }}>Nenhum técnico cadastrado.</Text>}
          </View>
        </View>
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', borderRadius: 12, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  card: { padding: 20 },
  cardNumber: { fontSize: 32, fontWeight: 'bold', marginBottom: 5 },
  cardLabel: { fontSize: 14, fontWeight: '600' },
  rankingWrapper: { borderRadius: 12, marginTop: 10, marginBottom: 50, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  rankingBox: { padding: 20 },
  rankingTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  rankingSubtitle: { fontSize: 14, marginBottom: 15 },
  rankingItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  rankingName: { fontSize: 16, fontWeight: '500' },
  rankingCount: { fontSize: 16, fontWeight: 'bold' }
});