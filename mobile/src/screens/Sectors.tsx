import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import GlassCard from '../components/GlassCard';

export default function Sectors() {
  const [sectors, setSectors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { colors } = useContext(ThemeContext);

  // busca os setores cadastrados no backend
  async function loadSectors() {
    try {
      setError(false);
      const res = await api.get('/api/v1/sectors');
      setSectors(res.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSectors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSectors();
  };

  // filtra por nome do setor, bloco ou descricao
  const filteredSectors = sectors.filter((sector: any) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      (sector.name || '').toLowerCase().includes(term) ||
      (sector.building || '').toLowerCase().includes(term) ||
      (sector.description || '').toLowerCase().includes(term)
    );
  });

  return (
    <XmbBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentSilver} />}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Setores e Blocos</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Locais de atendimento e infraestrutura do campus.</Text>

        {/* filtro rapido de setor/bloco */}
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Buscar setor ou bloco..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        {loading ? (
          <ActivityIndicator size="large" color={colors.accentSilver} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.emptyBox}>
            <Text style={{ color: colors.statusDanger, marginBottom: 12 }}>Erro ao carregar setores.</Text>
            <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.border }]} onPress={loadSectors}>
              <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : filteredSectors.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhum setor encontrado.</Text>
        ) : (
          filteredSectors.map((sector: any) => (
            <GlassCard key={sector.id}>
              <View style={styles.cardBody}>
                <View style={styles.headerRow}>
                  <View style={styles.nameRow}>
                    <Feather name="map-pin" size={18} color={colors.accentSilver} style={{ marginRight: 8 }} />
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{sector.name}</Text>
                  </View>
                  {sector.building ? (
                    <View style={[styles.buildingBadge, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                      <Text style={[styles.buildingText, { color: colors.accentSilver }]}>{sector.building}</Text>
                    </View>
                  ) : null}
                </View>
                {sector.description ? (
                  <Text style={[styles.desc, { color: colors.textSecondary }]}>{sector.description}</Text>
                ) : null}
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 15 },
  searchInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 16 },
  cardBody: { padding: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  name: { fontSize: 17, fontWeight: 'bold', flexShrink: 1 },
  buildingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  buildingText: { fontSize: 12, fontWeight: '600' },
  desc: { fontSize: 13, marginTop: 4 },
  emptyBox: { alignItems: 'center', marginTop: 30 },
  emptyText: { textAlign: 'center', marginTop: 30 },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1 },
});
