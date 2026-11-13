// mobile/src/screens/MyTickets.tsx
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext'; // <-- Importando o novo contexto
import XmbBackground from '../components/XmbBackground';

export default function MyTickets({ navigation }: any) {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext); // <-- Pegando as cores dinâmicas

  const loadTickets = useCallback(async () => {
    try {
      let url = '/api/v1/tickets?';
      if (search) url += `search=${search}&`;
      if (filterStatus) url += `status=${filterStatus}&`;
      const response = await api.get(url);
      setTickets(response.data);
    } catch (error) { console.error(error); }
  }, [search, filterStatus]);

  useFocusEffect(useCallback(() => { loadTickets(); }, [loadTickets]));

  function renderItem({ item }: any) {
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate('TicketDetails', { ticket: item, userRole: user?.role })}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.cardDate, { color: colors.textMuted }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        <View style={[styles.badge, { backgroundColor: colors.glassTint }]}>
          <Text style={[styles.badgeText, { color: colors.accentSilver }]}>{item.status.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <XmbBackground>
      <View style={[styles.headerArea, { backgroundColor: colors.surfaceElevated }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.backgroundDeep, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Buscar chamados..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
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

      <FlatList
        data={tickets}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 15, paddingTop: 10 }}
        ListEmptyComponent={<Text style={[styles.empty, { color: colors.textMuted }]}>Nenhum chamado encontrado.</Text>}
      />
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  headerArea: { padding: 15 },
  searchInput: { padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 13 },
  card: { padding: 15, marginTop: 10, borderRadius: 8, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  cardDate: { fontSize: 12 },
  cardDesc: { fontSize: 14, marginBottom: 10 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50 },
});