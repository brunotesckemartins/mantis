// mobile/src/screens/NewTicket.tsx
import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/client';
import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import XmbBackground from '../components/XmbBackground';
import CustomSelect from '../components/CustomSelect';
import { getApiErrorMessage } from '../utils/apiError';
import { confirmAction } from '../utils/confirm';
import {
  DESCRIPTION_MAX,
  PRIORITY_OPTIONS,
  PriorityValue,
  TITLE_MAX,
  validateTicketForm,
} from '../utils/ticketForm';

interface Category {
  id: number;
  name: string;
  active?: boolean;
}

export default function NewTicket({ navigation }: any) {
  const { colors } = useContext(ThemeContext);
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityValue>('media');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // controle de quando mostrar as mensagens de erro de cada campo
  const [touched, setTouched] = useState<{ title?: boolean; description?: boolean }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // evita o aviso de "descartar chamado" depois que o chamado foi enviado
  const submittedRef = useRef(false);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError(false);
    try {
      const res = await api.get('/api/v1/categories');
      setCategories(res.data);
    } catch (error) {
      setCategoriesError(true);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const errors = useMemo(
    () => validateTicketForm({ title, description, categoryId }),
    [title, description, categoryId],
  );

  const showTitleError = (touched.title || submitAttempted) && errors.title;
  const showDescriptionError = (touched.description || submitAttempted) && errors.description;
  const showCategoryError = submitAttempted && errors.categoryId;

  // se o usuário já digitou algo, pergunta antes de fechar a tela
  const isDirty = title.trim().length > 0 || description.trim().length > 0 || !!image;

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isDirty || submittedRef.current) return;

      e.preventDefault();
      confirmAction({
        title: 'Descartar chamado?',
        message: 'O que você preencheu será perdido.',
        confirmText: 'Descartar',
        cancelText: 'Continuar editando',
        destructive: true,
      }).then((discard) => {
        if (discard) navigation.dispatch(e.data.action);
      });
    });
    return unsubscribe;
  }, [navigation, isDirty]);

  async function pickImage() {
    // na web o alert com botoes nao funciona, entao abre a galeria direto
    if (Platform.OS === 'web') {
      launchImagePicker('gallery');
      return;
    }
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
        if (status !== 'granted') return showToast('Precisamos de acesso à câmera.', 'error');
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.5 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return showToast('Precisamos de acesso à galeria.', 'error');
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5 });
      }

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) { showToast('Erro ao acessar a câmera/galeria.', 'error'); }
  }

  async function handleCreate() {
    if (sending) return;

    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0) {
      return showToast('Corrija os campos destacados.', 'error');
    }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('ticket[title]', title.trim());
      formData.append('ticket[description]', description.trim());
      formData.append('ticket[priority]', priority);
      formData.append('ticket[category_id]', categoryId);

      // corrige o nome do campo para photos[] que o backend rails espera
      if (image) {
        if (Platform.OS === 'web') {
          const response = await fetch(image);
          const blob = await response.blob();
          formData.append('ticket[photos][]', blob, 'photo.jpg');
        } else {
          formData.append('ticket[photos][]', { uri: image, name: 'photo.jpg', type: 'image/jpeg' } as any);
        }
      }

      await api.post('/api/v1/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      submittedRef.current = true;
      showToast('Chamado aberto com sucesso!', 'success');
      navigation.goBack();
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Não foi possível abrir o chamado.'), 'error');
    } finally {
      setSending(false);
    }
  }

  const categoryOptions = categories.map(c => ({ label: c.name, value: String(c.id) }));

  const priorityColor = (value: PriorityValue) => {
    if (value === 'baixa') return colors.statusSuccess;
    if (value === 'media') return colors.statusInfo;
    if (value === 'alta') return colors.statusWarning;
    return colors.statusDanger;
  };
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === priority);

  return (
    <XmbBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.label, { color: colors.textPrimary }]}>Título do Problema</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.surface, borderColor: showTitleError ? colors.statusDanger : colors.border, color: colors.textPrimary },
            ]}
            value={title}
            onChangeText={setTitle}
            onBlur={() => setTouched(t => ({ ...t, title: true }))}
            maxLength={TITLE_MAX}
            placeholder="Ex: Computador não liga"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Título do problema"
            returnKeyType="next"
          />
          <View style={styles.helperRow}>
            <Text style={[styles.errorText, { color: colors.statusDanger }]}>{showTitleError || ' '}</Text>
            <Text style={[styles.counter, { color: colors.textMuted }]}>{title.length}/{TITLE_MAX}</Text>
          </View>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Descrição</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.surface, borderColor: showDescriptionError ? colors.statusDanger : colors.border, color: colors.textPrimary },
            ]}
            value={description}
            onChangeText={setDescription}
            onBlur={() => setTouched(t => ({ ...t, description: true }))}
            maxLength={DESCRIPTION_MAX}
            multiline
            placeholder="Descreva o problema com detalhes: onde acontece, desde quando e o que já tentou."
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Descrição do problema"
          />
          <View style={styles.helperRow}>
            <Text style={[styles.errorText, { color: colors.statusDanger }]}>{showDescriptionError || ' '}</Text>
            <Text style={[styles.counter, { color: colors.textMuted }]}>{description.length}/{DESCRIPTION_MAX}</Text>
          </View>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Categoria</Text>
          {loadingCategories ? (
            <ActivityIndicator color={colors.accentSilver} style={{ marginVertical: 14 }} />
          ) : categoriesError ? (
            <View style={[styles.stateBox, { borderColor: colors.statusDanger }]}>
              <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>Não foi possível carregar as categorias.</Text>
              <TouchableOpacity onPress={loadCategories} accessibilityRole="button">
                <Text style={{ color: colors.accentSilver, fontWeight: 'bold' }}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : categories.length === 0 ? (
            <View style={[styles.stateBox, { borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary }}>Nenhuma categoria disponível no momento. Procure o suporte presencialmente.</Text>
            </View>
          ) : (
            <CustomSelect
              options={categoryOptions}
              selectedValue={categoryId}
              onValueChange={setCategoryId}
              placeholder="Selecione uma categoria"
            />
          )}
          <Text style={[styles.errorText, { color: colors.statusDanger, marginTop: 6 }]}>{showCategoryError || ' '}</Text>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Prioridade</Text>
          <View style={styles.chipsRow}>
            {PRIORITY_OPTIONS.map(option => {
              const selected = option.value === priority;
              const color = priorityColor(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    { backgroundColor: selected ? `${color}25` : colors.surface, borderColor: selected ? color : colors.border },
                  ]}
                  onPress={() => setPriority(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Prioridade ${option.label}`}
                >
                  <Text style={{ color: selected ? color : colors.textSecondary, fontWeight: selected ? 'bold' : '500', fontSize: 14 }}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedPriority && <Text style={[styles.hint, { color: colors.textMuted }]}>{selectedPriority.hint}</Text>}

          <Text style={[styles.label, { color: colors.textPrimary }]}>Foto do Problema (Opcional)</Text>
          <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]} onPress={pickImage}>
            <Text style={[styles.photoButtonText, { color: colors.accentSilver }]}>📷 Anexar Imagem</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 8 }} />}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accentSilver, opacity: sending ? 0.6 : 1 }]}
            onPress={handleCreate}
            disabled={sending}
            accessibilityRole="button"
          >
            {sending ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>Abrir Chamado</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </XmbBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 15 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  helperRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  errorText: { fontSize: 12, flex: 1, marginRight: 10 },
  counter: { fontSize: 12 },
  stateBox: { borderWidth: 1, borderRadius: 12, padding: 14 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  hint: { fontSize: 13, marginTop: 2 },
  photoButton: { padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  photoButtonText: { fontSize: 16, fontWeight: 'bold' },
  button: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 50, minHeight: 58, justifyContent: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
});
