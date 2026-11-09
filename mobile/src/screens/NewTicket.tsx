// mobile/src/screens/NewTicket.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api/client';

export default function NewTicket({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [categoryId, setCategoryId] = useState(1);

  async function handleCreate() {
    if (!title || !description) {
      Alert.alert('Atenção', 'Preencha o título e a descrição.');
      return;
    }

    try {
      await api.post('/api/v1/tickets', {
        ticket: {
          title,
          description,
          priority,
          category_id: categoryId
        }
      });
      
      Alert.alert('Sucesso', 'Chamado aberto com sucesso!');
      navigation.goBack(); // Volta para a tela anterior
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível abrir o chamado.');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Título do Problema</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: Computador não liga" />

      <Text style={styles.label}>Descrição</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={description} 
        onChangeText={setDescription} 
        placeholder="Descreva o problema com detalhes..."
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={categoryId} onValueChange={(itemValue) => setCategoryId(itemValue)}>
          <Picker.Item label="Hardware" value={1} />
          <Picker.Item label="Software" value={2} />
        </Picker>
      </View>

      <Text style={styles.label}>Prioridade</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={priority} onValueChange={(itemValue) => setPriority(itemValue)}>
          <Picker.Item label="Baixa" value="baixa" />
          <Picker.Item label="Média" value="media" />
          <Picker.Item label="Alta" value="alta" />
          <Picker.Item label="Crítica" value="critica" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Abrir Chamado</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#333', marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 5 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});