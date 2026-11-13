// mobile/src/screens/Sectors.tsx
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import GlassCard from '../components/GlassCard'; // <-- Importando

export default function Sectors() {
  const [sectors, setSectors] = useState([]);
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    api.get('/api/v1/sectors').then(res => setSectors(res.data)).catch(console.error);
  }, []);

  return (
    <XmbBackground>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Setores e Blocos</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Locais de atendimento e infraestrutura.</Text>

        {sectors.map((sector: any) => (
          <GlassCard key={sector.id}>
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Feather name="map-pin" size={18} color={colors.accentSilver} style={{ marginRight: 8 }} />
                <Text style={[styles.name, { color: colors.textPrimary }]}>{sector.name}</Text>
              </View>
              <Text style={[styles.building, { color: colors.textSecondary }]}>{sector.building}</Text>
              {sector.description && <Text style={[styles.desc, { color: colors.textMuted }]}>{sector.description}</Text>}
            </View>
          </GlassCard>
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
  name: { fontSize: 18, fontWeight: 'bold' },
  building: { fontSize: 14, marginBottom: 5 },
  desc: { fontSize: 13 },
});