import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';
import GlassCard from '../components/GlassCard';

export default function Faq({ navigation }: any) {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { colors } = useContext(ThemeContext);

  // carrega as duvidas frequentes da api
  async function loadFaqs() {
    try {
      setError(false);
      const res = await api.get('/api/v1/faqs');
      setFaqs(res.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadFaqs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFaqs();
  };

  // filtra localmente por pergunta, resposta ou categoria
  const filteredFaqs = faqs.filter((faq: any) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      (faq.question || '').toLowerCase().includes(term) ||
      (faq.answer || '').toLowerCase().includes(term) ||
      (faq.category || '').toLowerCase().includes(term)
    );
  });

  return (
    <XmbBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentSilver} />}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Dúvidas Frequentes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Veja se seu problema já tem solução antes de abrir um chamado.
        </Text>

        {/* campo simples de busca */}
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Buscar dúvida..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        {loading ? (
          <ActivityIndicator size="large" color={colors.accentSilver} style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.emptyBox}>
            <Text style={{ color: colors.statusDanger, marginBottom: 12 }}>Erro ao carregar dúvidas.</Text>
            <TouchableOpacity style={[styles.retryBtn, { borderColor: colors.border }]} onPress={loadFaqs}>
              <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : filteredFaqs.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhuma dúvida encontrada.</Text>
        ) : (
          filteredFaqs.map((faq: any) => {
            const isOpen = expandedId === faq.id;
            return (
              // abre ou fecha a resposta clicada (estilo acordeao)
              <GlassCard key={faq.id} onPress={() => setExpandedId(isOpen ? null : faq.id)}>
                <View style={styles.cardBody}>
                  {faq.category ? (
                    <Text style={[styles.categoryTag, { color: colors.accentSilver }]}>{faq.category.toUpperCase()}</Text>
                  ) : null}
                  <View style={styles.cardHeader}>
                    <Text style={[styles.question, { color: colors.textPrimary }]}>{faq.question}</Text>
                    <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.accentSilver} />
                  </View>
                  {isOpen && (
                    <Text style={[styles.answer, { color: colors.textSecondary }]}>{faq.answer}</Text>
                  )}
                </View>
              </GlassCard>
            );
          })
        )}

        {/* atalho pra abrir chamado caso a faq nao resolva */}
        {!loading && (
          <TouchableOpacity
            style={[styles.helpBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('NewTicket')}
          >
            <Feather name="plus-circle" size={18} color={colors.accentSilver} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Não resolveu? Abrir um chamado</Text>
          </TouchableOpacity>
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
  categoryTag: { fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 10 },
  answer: { fontSize: 14, marginTop: 10, lineHeight: 20 },
  emptyBox: { alignItems: 'center', marginTop: 30 },
  emptyText: { textAlign: 'center', marginTop: 30 },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1 },
  helpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, borderWidth: 1, marginTop: 10 },
});
