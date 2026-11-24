// mobile/src/screens/MyTickets.tsx
import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import api from '../api/client';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import XmbBackground from '../components/XmbBackground';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { getApiErrorMessage } from '../utils/apiError';
import { STATUS_FILTERS, TicketStatus, formatDate, getPriorityColor, getPriorityLabel } from '../utils/ticketStatus';

// recorte da lista para o técnico: fila de chamados livres ou os que ele está atendendo
type TechScope = 'todos' | 'fila' | 'meus';
const TECH_SCOPES: { value: TechScope; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { value: 'todos', label: 'Todos', icon: 'list' },
  { value: 'fila', label: 'Fila aberta', icon: 'inbox' },
  { value: 'meus', label: 'Meus atendimentos', icon: 'user-check' },
];

export default function MyTickets({ navigation }: any) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [techScope, setTechScope] = useState<TechScope>('todos');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | TicketStatus>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const { showToast } = useToast();

  // guarda qual foi a última requisição enviada, para ignorar respostas atrasadas
  const requestId = useRef(0);

  // espera o usuário parar de digitar antes de buscar no servidor
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTickets = useCallback(async () => {
    const current = ++requestId.current;
    try {
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatus) params.status = filterStatus;

      const response = await api.get('/api/v1/tickets', { params });
      if (current !== requestId.current) return;
      setTickets(response.data);
      setError(false);
    } catch (err) {
      if (current !== requestId.current) return;
      setError(true);
      showToast(getApiErrorMessage(err, 'Erro ao carregar chamados.'), 'error');
    } finally {
      if (current === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [debouncedSearch, filterStatus]);

  // recarrega ao voltar para a tela (ex.: depois de abrir um chamado) e quando muda busca/filtro
  useFocusEffect(useCallback(() => { loadTickets(); }, [loadTickets]));

  const onRefresh = () => { setRefreshing(true); loadTickets(); };

  const isRequester = user?.role === 'requester';
  const isTechnician = user?.role === 'technician';
  const hasFilters = !!debouncedSearch || !!filterStatus || (isTechnician && techScope !== 'todos');

  const visibleTickets = !isTechnician || techScope === 'todos'
    ? tickets
    : tickets.filter(t => techScope === 'fila'
      ? t.status === 'aberto' && !t.technician
      : t.technician?.id === user?.id);

  const scopeCount = (scope: TechScope) => scope === 'todos'
    ? tickets.length
    : tickets.filter(t => scope === 'fila' ? t.status === 'aberto' && !t.technician : t.technician?.id === user?.id).length;

  function clearFilters() {
    setSearch('');
    setDebouncedSearch('');
    setFilterStatus('');
    setTechScope('todos');
  }

  function renderItem({ item }: any) {
    // o solicitante já sabe quem abriu: mostra o técnico responsável
    const personLabel = isRequester
      ? (item.technician?.name ? `Técnico: ${item.technician.name}` : 'Aguardando técnico')
      : item.requester?.name;

    return (
      <GlassCard onPress={() => navigation.navigate('TicketDetails', { ticket: item, userRole: user?.role })}>
        <View style={{ padding: 20 }}>
          <View style={styles.topRow}>
            <Text style={{ color: colors.accentSilver, fontSize: 11, fontWeight: 'bold' }}>{item.code || `#${item.id}`}</Text>
            <Text style={[styles.cardDate, { color: colors.textMuted }]}>{formatDate(item.created_at)}</Text>
          </View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>

          <View style={styles.bottomRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <StatusBadge status={item.status} />
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority, colors) }]} />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{getPriorityLabel(item.priority)}</Text>
            </View>
            {!!personLabel && <Text style={{ color: colors.textMuted, fontSize: 12, flexShrink: 1, marginLeft: 10 }} numberOfLines={1}>{personLabel}</Text>}
          </View>
        </View>
      </GlassCard>
    );
  }

  function renderEmpty() {
    if (error) {
      return (
        <View style={styles.emptyBox}>
          <Feather name="wifi-off" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Não foi possível carregar</Text>
          <Text style={[styles.empty, { color: colors.textMuted }]}>Verifique sua conexão e tente de novo.</Text>
          <TouchableOpacity style={[styles.emptyButton, { borderColor: colors.accentSilver }]} onPress={() => { setLoading(true); loadTickets(); }}>
            <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasFilters) {
      return (
        <View style={styles.emptyBox}>
          <Feather name="search" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Nada encontrado</Text>
          <Text style={[styles.empty, { color: colors.textMuted }]}>Nenhum chamado combina com a busca ou o filtro escolhido.</Text>
          <TouchableOpacity style={[styles.emptyButton, { borderColor: colors.accentSilver }]} onPress={clearFilters}>
            <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>Limpar filtros</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyBox}>
        <Feather name="inbox" size={32} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          {isRequester ? 'Você ainda não abriu chamados' : 'Nenhum chamado por aqui'}
        </Text>
        {isRequester && (
          <>
            <Text style={[styles.empty, { color: colors.textMuted }]}>Está com algum problema? Abra um chamado e acompanhe o andamento aqui.</Text>
            <TouchableOpacity style={[styles.emptyButton, { borderColor: colors.accentSilver }]} onPress={() => navigation.navigate('NewTicket')}>
              <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>Abrir um chamado</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <XmbBackground>
      <View style={[styles.headerArea, { backgroundColor: colors.surfaceElevated }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.backgroundDeep, color: colors.textPrimary, borderColor: colors.border }]}
          placeholder="Buscar por título ou descrição..." placeholderTextColor={colors.textMuted}
          value={search} onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Buscar chamados"
        />
        {isTechnician && (
          <View style={[styles.segment, { borderColor: colors.border, backgroundColor: colors.backgroundDeep }]}>
            {TECH_SCOPES.map(scope => {
              const selected = techScope === scope.value;
              return (
                <TouchableOpacity
                  key={scope.value}
                  style={[styles.segmentBtn, selected && { backgroundColor: colors.accentSilver }]}
                  onPress={() => setTechScope(scope.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Feather name={scope.icon} size={13} color={selected ? colors.background : colors.textSecondary} />
                  <Text style={[styles.segmentText, { color: selected ? colors.background : colors.textSecondary }, selected && { fontWeight: 'bold' }]} numberOfLines={1}>
                    {scope.label} ({scopeCount(scope.value)})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
          {STATUS_FILTERS.map((filter) => {
            const selected = filterStatus === filter.value;
            return (
              <TouchableOpacity
                key={filter.value || 'todos'}
                style={[styles.filterBtn, { backgroundColor: colors.surface, borderColor: colors.border }, selected && { backgroundColor: colors.accentSilver }]}
                onPress={() => setFilterStatus(filter.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.filterText, { color: colors.textSecondary }, selected && { color: colors.background, fontWeight: 'bold' }]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accentSilver} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={visibleTickets}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 15, paddingTop: 10, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentSilver} />}
          ListHeaderComponent={
            visibleTickets.length > 0 ? (
              <Text style={[styles.counter, { color: colors.textMuted }]}>
                {visibleTickets.length} {visibleTickets.length === 1 ? 'chamado' : 'chamados'}
              </Text>
            ) : undefined
          }
          ListEmptyComponent={renderEmpty()}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* atalho para o solicitante abrir um novo chamado sem voltar para a home */}
      {isRequester && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.accentSilver }]}
          onPress={() => navigation.navigate('NewTicket')}
          accessibilityRole="button"
          accessibilityLabel="Abrir novo chamado"
        >
          <Feather name="plus" size={26} color={colors.background} />
        </TouchableOpacity>
      )}
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  headerArea: { padding: 15 },
  searchInput: { padding: 12, borderRadius: 12, fontSize: 16, borderWidth: 1 },
  segment: { flexDirection: 'row', marginTop: 12, borderRadius: 12, borderWidth: 1, padding: 3 },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 9 },
  segmentText: { fontSize: 11, marginLeft: 4, flexShrink: 1 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  filterText: { fontSize: 13 },
  counter: { fontSize: 12, marginBottom: 10, marginLeft: 5 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardDate: { fontSize: 12 },
  cardDesc: { fontSize: 14, marginBottom: 10 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 12, marginRight: 5 },
  emptyBox: { alignItems: 'center', paddingHorizontal: 30, marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 14, marginBottom: 6, textAlign: 'center' },
  empty: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
  emptyButton: { marginTop: 18, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1 },
  fab: {
    position: 'absolute', right: 24, bottom: 110, width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});
