// mobile/src/screens/NewTicket.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import XmbBackground from '../components/XmbBackground';

export default function NewTicket({ navigation }: any) {
  const { colors } = useContext(ThemeContext);
  
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

  // --- LÓGICA DE FOTO E PERMISSÕES ---
  async function pickImage() {
    Alert.alert('Adicionar Foto', 'Escolha a origem da imagem:', [
      { text: 'Câmera', onPress: () => launchImagePicker('camera') },
      { text: 'Galeria', onPress: () => launchImagePicker('gallery') },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  }

  async function launchImagePicker(source: 'camera' | 'gallery') {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          return Alert.alert('Permissão Negada', 'Precisamos de acesso à câmera para tirar a foto do problema.');
        }
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.5 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          return Alert.alert('Permissão Negada', 'Precisamos de acesso à galeria para anexar a imagem.');
        }
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5 });
      }

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri);
        Alert.alert("Foto de Perfil", "Deseja salvar esta foto também como sua foto de perfil?", [
          { text: "Não", style: "cancel" },
          { text: "Sim", onPress: () => saveAsProfilePic(uri) }
        ]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao acessar a câmera/galeria.');
    }
  }

  async function saveAsProfilePic(uri: string) {
    const formData = new FormData();
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('avatar', blob, `avatar.jpg`);
    try {
      await api.patch('/api/v1/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Sucesso', 'Sua foto de perfil foi atualizada!');
    } catch (error) { console.error(error); }
  }

  async function handleCreate() {
    if (!title || !description || !categoryId) return Alert.alert('Atenção', 'Preencha todos os campos.');

    const formData = new FormData();
    formData.append('ticket[title]', title);
    formData.append('ticket[description]', description);
    formData.append('ticket[priority]', priority);
    formData.append('ticket[category_id]', categoryId);

    if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append('ticket[photo]', blob, `photo.jpg`);
    }

    try {
      await api.post('/api/v1/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Sucesso', 'Chamado aberto com sucesso!');
      navigation.goBack();
    } catch (error) { Alert.alert('Erro', 'Não foi possível abrir o chamado.'); }
  }

  return (
    <XmbBackground>
      <ScrollView style={styles.container}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Título do Problema</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} 
          value={title} 
          onChangeText={setTitle} 
          placeholder="Ex: Computador não liga" 
          placeholderTextColor={colors.textMuted} 
        />
        
        <Text style={[styles.label, { color: colors.textPrimary }]}>Descrição</Text>
        <TextInput 
          style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} 
          value={description} 
          onChangeText={setDescription} 
          multiline 
          placeholder="Descreva o problema com detalhes..." 
          placeholderTextColor={colors.textMuted} 
        />
        
        <Text style={[styles.label, { color: colors.textPrimary }]}>Categoria</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Picker selectedValue={categoryId} onValueChange={setCategoryId} style={{ color: colors.textPrimary }} dropdownIconColor={colors.textPrimary}>
            {categories.map(cat => <Picker.Item key={cat.id} label={cat.name} value={String(cat.id)} color={colors.textPrimary} />)}
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.textPrimary }]}>Prioridade</Text>
        <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Picker selectedValue={priority} onValueChange={setPriority} style={{ color: colors.textPrimary }} dropdownIconColor={colors.textPrimary}>
            <Picker.Item label="Baixa" value="baixa" color={colors.textPrimary} />
            <Picker.Item label="Média" value="media" color={colors.textPrimary} />
            <Picker.Item label="Alta" value="alta" color={colors.textPrimary} />
            <Picker.Item label="Crítica" value="critica" color={colors.textPrimary} />
          </Picker>
        </View>

        <Text style={[styles.label, { color: colors.textPrimary }]}>Foto do Problema (Opcional)</Text>
        <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={pickImage}>
          <Text style={[styles.photoButtonText, { color: colors.accentSilver }]}>📷 Anexar Imagem</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 8 }} />}

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.accentSilver }]} onPress={handleCreate}>
          <Text style={[styles.buttonText, { color: colors.background }]}>Abrir Chamado</Text>
        </TouchableOpacity>
      </ScrollView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderRadius: 8, marginBottom: 5, overflow: 'hidden' },
  photoButton: { padding: 15, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  photoButtonText: { fontSize: 16, fontWeight: 'bold' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 50 },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
});