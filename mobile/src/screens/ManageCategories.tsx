// mobile/src/screens/ManageCategories.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const { colors } = useContext(ThemeContext);

  async function loadCategories() {
    try {
      const response = await api.get('/api/v1/categories');
      setCategories(response.data);
    } catch (error) { console.error(error); }
  }

  useEffect(() => { loadCategories(); }, []);

  async function handleCreate() {
    if (!newCategory) return;
    try {
      await api.post('/api/v1/categories', { category: { name: newCategory, active: true } });
      setNewCategory('');
      loadCategories();
      Alert.alert('Sucesso', 'Categoria criada!');
    } catch (error) { Alert.alert('Erro', 'Não foi possível criar a categoria.'); }
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    try {
      await api.patch(`/api/v1/categories/${id}`, { category: { active: !currentStatus } });
      loadCategories();
    } catch (error) { Alert.alert('Erro', 'Não foi possível alterar o status.'); }
  }

  return (
    <XmbBackground>
      <View style={styles.container}>
        <View style={[styles.createBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>Nova Categoria</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundDeep, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Ex: Impressoras, Rede..."
            placeholderTextColor={colors.textMuted}
            value={newCategory}
            onChangeText={setNewCategory}
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver }]} onPress={handleCreate}>
            <Text style={[styles.buttonText, { color: colors.background }]}>Adicionar Categoria</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.textPrimary, marginTop: 20, marginBottom: 10 }]}>Categorias Cadastradas</Text>
        <FlatList
          data={categories}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }: any) => (
            <View style={[styles.categoryItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.categoryText, { color: item.active ? colors.textPrimary : colors.textMuted }]}>
                {item.name} {!item.active && '(Inativa)'}
              </Text>
              <TouchableOpacity onPress={() => toggleActive(item.id, item.active)}>
                <Text style={{ color: item.active ? '#FF453A' : '#32D74B', fontWeight: 'bold' }}>
                  {item.active ? 'Desativar' : 'Ativar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  createBox: { padding: 15, borderRadius: 8, borderWidth: 1 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 10 },
  button: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center', borderWidth: 1 },
  categoryText: { fontSize: 16, fontWeight: '500' }
});