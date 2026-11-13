// mobile/src/screens/Sectors.tsx
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function Sectors() {
  const [sectors, setSectors] = useState([]);
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    api.get('/api/v1/sectors').then(res => setSectors(res.data)).catch(console.error);
  }, []);

  return (
    <XmbBackground>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Setores e Blocos</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Locais de atendimento e infraestrutura.</Text>

        {sectors.map((sector: any) => (
          <View key={sector.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <Feather name="map-pin" size={18} color={colors.accentSilver} style={{ marginRight: 8 }} />
              <Text style={[styles.name, { color: colors.textPrimary }]}>{sector.name}</Text>
            </View>
            <Text style={[styles.building, { color: colors.textSecondary }]}>{sector.building}</Text>
            {sector.description && <Text style={[styles.desc, { color: colors.textMuted }]}>{sector.description}</Text>}
          </View>
        ))}
        {sectors.length === 0 && <Text style={{ color: colors.textMuted, marginTop: 20 }}>Nenhum setor cadastrado.</Text>}
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  card: { padding: 15, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  building: { fontSize: 14, marginBottom: 5 },
  desc: { fontSize: 13 },
});