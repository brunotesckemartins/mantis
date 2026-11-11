// mobile/src/screens/MyTickets.tsx
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';

export default function MyTickets({ navigation }: any) {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const { user } = useContext(AuthContext); // Removemos o signOut daqui, pois agora fica no Perfil

  const loadTickets = useCallback(async () => {
    try {
      let url = '/api/v1/tickets?';
      if (search) url += `search=${search}&`;
      if (filterStatus) url += `status=${filterStatus}&`;

      const response = await api.get(url);
      setTickets(response.data);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    }
  }, [search, filterStatus]);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [loadTickets])
  );

  function renderItem({ item }: any) {
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('TicketDetails', { ticket: item, userRole: user?.role })}
      >
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.badge}><Text style={styles.badgeText}>{item.status.toUpperCase()}</Text></View>
          <Text style={{ fontSize: 12, color: '#999' }}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Chamados</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {user?.role === 'manager' && (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={{ marginRight: 15 }}>
                <Text style={{ color: '#AF52DE', fontWeight: 'bold' }}>Painel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('ManageCategories')} style={{ marginRight: 15 }}>
                <Text style={{ color: 'blue', fontWeight: 'bold' }}>Categorias</Text>
              </TouchableOpacity>
            </>
          )}
          {/* NOVO BOTÃO DE PERFIL */}
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título ou descrição..."
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <TouchableOpacity style={[styles.filterBtn, filterStatus === '' && styles.filterBtnActive]} onPress={() => setFilterStatus('')}>
            <Text style={[styles.filterText, filterStatus === '' && styles.filterTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filterStatus === 'aberto' && styles.filterBtnActive]} onPress={() => setFilterStatus('aberto')}>
            <Text style={[styles.filterText, filterStatus === 'aberto' && styles.filterTextActive]}>Abertos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filterStatus === 'em_atendimento' && styles.filterBtnActive]} onPress={() => setFilterStatus('em_atendimento')}>
            <Text style={[styles.filterText, filterStatus === 'em_atendimento' && styles.filterTextActive]}>Em Atendimento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filterStatus === 'resolvido' && styles.filterBtnActive]} onPress={() => setFilterStatus('resolvido')}>
            <Text style={[styles.filterText, filterStatus === 'resolvido' && styles.filterTextActive]}>Resolvidos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 15 }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum chamado encontrado.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewTicket')}>
        <Text style={styles.fabText}>+ Novo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  filterContainer: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  searchInput: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, fontSize: 16 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#007AFF' },
  filterText: { color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, marginTop: 15, borderRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#666', marginBottom: 10 },
  badge: { backgroundColor: '#e0e0e0', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  empty: { textAlign: 'center', marginTop: 50, color: '#666' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 30, elevation: 3 },
  fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});