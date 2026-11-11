// mobile/src/screens/NewTicket.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';

export default function NewTicket({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/v1/categories').then(res => {
      setCategories(res.data);
      if (res.data.length > 0) setCategoryId(String(res.data[0].id));
    });
  }, []);

  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Você precisa permitir o acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  async function handleCreate() {
    if (!title || !description || !categoryId) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    const formData = new FormData();
    formData.append('ticket[title]', title);
    formData.append('ticket[description]', description);
    formData.append('ticket[priority]', priority);
    formData.append('ticket[category_id]', categoryId);

    if (image) {
      // Lógica para converter a imagem para envio (funciona na Web e no Celular)
      const response = await fetch(image);
      const blob = await response.blob();
      const fileExt = image.split('.').pop() || 'jpg';
      formData.append('ticket[photo]', blob, `photo.${fileExt}`);
    }

    try {
      await api.post('/api/v1/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Alert.alert('Sucesso', 'Chamado aberto com sucesso!');
      navigation.goBack();
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
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={categoryId} onValueChange={setCategoryId}>
          {categories.map(cat => <Picker.Item key={cat.id} label={cat.name} value={String(cat.id)} />)}
        </Picker>
      </View>

      <Text style={styles.label}>Prioridade</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={priority} onValueChange={setPriority}>
          <Picker.Item label="Baixa" value="baixa" />
          <Picker.Item label="Média" value="media" />
          <Picker.Item label="Alta" value="alta" />
          <Picker.Item label="Crítica" value="critica" />
        </Picker>
      </View>

      <Text style={styles.label}>Foto do Problema (Opcional)</Text>
      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Text style={styles.photoButtonText}>📷 Anexar Imagem</Text>
      </TouchableOpacity>
      
      {image && (
        <Image source={{ uri: image }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 8 }} />
      )}

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
  photoButton: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed' },
  photoButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});