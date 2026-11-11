// mobile/src/screens/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import api from '../api/client';

export default function Dashboard({ navigation }: any) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/api/v1/dashboard')
      .then(response => setData(response.data))
      .catch(err => console.error('Erro ao buscar dashboard:', err));
  }, []);

  if (!data) {
    return <Text style={{ textAlign: 'center', marginTop: 50 }}>Carregando métricas...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        <View style={[styles.card, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.cardNumber}>{data.total}</Text>
          <Text style={styles.cardLabel}>Total de Chamados</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
          <Text style={[styles.cardNumber, { color: '#FF9800' }]}>{data.abertos}</Text>
          <Text style={styles.cardLabel}>Abertos</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#F3E5F5' }]}>
          <Text style={[styles.cardNumber, { color: '#9C27B0' }]}>{data.em_atendimento}</Text>
          <Text style={styles.cardLabel}>Em Atendimento</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.cardNumber, { color: '#4CAF50' }]}>{data.resolvidos}</Text>
          <Text style={styles.cardLabel}>Resolvidos</Text>
        </View>
      </View>

      <View style={styles.rankingBox}>
        <Text style={styles.rankingTitle}>🏆 Ranking de Técnicos</Text>
        <Text style={styles.rankingSubtitle}>Chamados resolvidos</Text>

        {data.ranking.map((tech: any, index: number) => (
          <View key={index} style={styles.rankingItem}>
            <Text style={styles.rankingName}>{index + 1}º {tech.name}</Text>
            <Text style={styles.rankingCount}>{tech.resolved_count}</Text>
          </View>
        ))}
        
        {data.ranking.length === 0 && <Text style={{ color: '#666' }}>Nenhum técnico cadastrado.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardNumber: { fontSize: 32, fontWeight: 'bold', color: '#1976D2', marginBottom: 5 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  rankingBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginTop: 10, elevation: 2, marginBottom: 50 },
  rankingTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  rankingSubtitle: { fontSize: 14, color: '#666', marginBottom: 15 },
  rankingItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  rankingName: { fontSize: 16, fontWeight: '500' },
  rankingCount: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' }
});