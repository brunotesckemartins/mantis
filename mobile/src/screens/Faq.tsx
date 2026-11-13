// mobile/src/screens/Faq.tsx
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    api.get('/api/v1/faqs').then(res => setFaqs(res.data)).catch(console.error);
  }, []);

  return (
    <XmbBackground>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Base de Conhecimento</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Resolva seu problema rapidamente antes de abrir um chamado.</Text>

        {faqs.map((faq: any) => (
          <TouchableOpacity 
            key={faq.id} 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.question, { color: colors.textPrimary }]}>{faq.question}</Text>
              <Feather name={expandedId === faq.id ? "chevron-up" : "chevron-down"} size={20} color={colors.accentSilver} />
            </View>
            {expandedId === faq.id && (
              <Text style={[styles.answer, { color: colors.textSecondary }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  card: { padding: 15, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  question: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 10 },
  answer: { fontSize: 14, marginTop: 10, lineHeight: 20 },
});