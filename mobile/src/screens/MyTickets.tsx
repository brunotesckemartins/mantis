// mobile/src/screens/MyTickets.tsx
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import GlassCard from '../components/GlassCard';

export default function MyTickets({ navigation }: any) {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const loadTickets = async () => {
    try {
      let url = '/api/v1/tickets?';
      if (search) url += `search=${search}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      const response = await api.get(url);
      setTickets(response.data);
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { loadTickets(); }, [search, filterStatus]));

  const onRefresh = () => { setRefreshing(true); loadTickets(); };

  // Função para pegar a cor do status (Padrão do app)
  const getStatusColor = (status: string) => {
    if (status === 'aberto') return colors.statusWarning;
    if (status === 'em_atendimento') return colors.statusInfo;
    if (status === 'resolvido') return colors.statusSuccess;
    return colors.textPrimary;
  };

  function renderItem({ item }: any) {
    return (
      <GlassCard onPress={() => navigation.navigate('TicketDetails', { ticket: item, userRole: user?.role })}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.cardDate, { color: colors.textMuted }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            {/* ETIQUETA COLORIDA PADRONIZADA */}
            <View style={[styles.badge, { backgroundColor: `${getStatusColor(item.status)}20`, borderColor: `${getStatusColor(item.status)}40` }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.requester?.name}</Text>
          </View>
        </View>
      </GlassCard>
    );
  }

  return (
    <XmbBackground>
      <View style={[styles.headerArea, { backgroundColor: colors.surfaceElevated }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.backgroundDeep, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Buscar chamados..." placeholderTextColor={colors.textMuted}
          value={search} onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
          {['', 'aberto', 'em_atendimento', 'resolvido'].map((status) => (
            <TouchableOpacity 
              key={status} 
              style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.border }, filterStatus === status && { backgroundColor: colors.accentSilver }]} 
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterText, { color: colors.textSecondary }, filterStatus === status && { color: colors.background, fontWeight: 'bold' }]}>
                {status === '' ? 'Todos' : status.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accentSilver} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 15, paddingTop: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentSilver} />}
          ListEmptyComponent={<Text style={[styles.empty, { color: colors.textMuted }]}>Nenhum chamado encontrado.</Text>}
        />
      )}
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  headerArea: { padding: 15 },
  searchInput: { padding: 12, borderRadius: 12, fontSize: 16, borderWidth: 1 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 13 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  cardDate: { fontSize: 12 },
  cardDesc: { fontSize: 14, marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50 },
});