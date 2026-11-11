// mobile/src/screens/MyTickets.tsx
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';

export default function MyTickets({ navigation }: any) {
  const [tickets, setTickets] = useState([]);
  const { signOut, user } = useContext(AuthContext); // Pega o user para saber o perfil

  useFocusEffect(
    useCallback(() => {
      async function loadTickets() {
        try {
          const response = await api.get('/api/v1/tickets');
          setTickets(response.data);
        } catch (error) {
          console.error('Erro ao buscar chamados:', error);
        }
      }
      loadTickets();
    }, [])
  );

  // Função que renderiza o card do chamado
  function renderItem({ item }: any) {
    return (
      <TouchableOpacity 
        style={styles.card}
        // Ao clicar, navega para a tela de detalhes passando o chamado e o perfil do usuário
        onPress={() => navigation.navigate('TicketDetails', { ticket: item, userRole: user?.role })}
      >
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Chamados</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum chamado encontrado.</Text>}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('NewTicket')}
      >
        <Text style={styles.fabText}>+ Novo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  logoutText: { color: 'red', fontSize: 16 },
  card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 15, marginTop: 15, borderRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#666', marginBottom: 10 },
  badge: { backgroundColor: '#e0e0e0', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  empty: { textAlign: 'center', marginTop: 50, color: '#666' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 30, elevation: 3 },
  fabText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});