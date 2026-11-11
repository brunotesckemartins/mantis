// mobile/src/screens/ManageCategories.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import api from '../api/client';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  async function loadCategories() {
    try {
      const response = await api.get('/api/v1/categories');
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate() {
    if (!newCategory) return;
    try {
      await api.post('/api/v1/categories', { category: { name: newCategory, active: true } });
      setNewCategory('');
      loadCategories();
      Alert.alert('Sucesso', 'Categoria criada!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a categoria.');
    }
  }

  async function toggleActive(id: number, currentStatus: boolean) {
    try {
      await api.patch(`/api/v1/categories/${id}`, { category: { active: !currentStatus } });
      loadCategories();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar o status.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.createBox}>
        <Text style={styles.label}>Nova Categoria</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Impressoras, Rede..."
          value={newCategory}
          onChangeText={setNewCategory}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Adicionar Categoria</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { marginTop: 20, marginBottom: 10 }]}>Categorias Cadastradas</Text>
      <FlatList
        data={categories}
        keyExtractor={(item: any) => String(item.id)}
        renderItem={({ item }: any) => (
          <View style={styles.categoryItem}>
            <Text style={[styles.categoryText, !item.active && { color: '#aaa' }]}>
              {item.name} {!item.active && '(Inativa)'}
            </Text>
            <TouchableOpacity onPress={() => toggleActive(item.id, item.active)}>
              <Text style={{ color: item.active ? 'red' : 'green', fontWeight: 'bold' }}>
                {item.active ? 'Desativar' : 'Ativar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  createBox: { backgroundColor: '#fff', padding: 15, borderRadius: 8 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 10 },
  button: { backgroundColor: '#AF52DE', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  categoryText: { fontSize: 16, fontWeight: '500' }
});