// mobile/src/components/PhotoPicker.tsx
import React, { useContext, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Platform, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { confirmAction } from '../utils/confirm';
import { MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_PHOTO_MB, PickedPhoto, assetToPhoto } from '../utils/photos';
import PhotoViewer from './PhotoViewer';

interface PhotoPickerProps {
  photos: PickedPhoto[];
  onChange: (photos: PickedPhoto[]) => void;
  max?: number;
  disabled?: boolean;
}

// Seletor de fotos: câmera ou galeria, várias fotos, pré-visualização e remoção.
export default function PhotoPicker({ photos, onChange, max = MAX_PHOTOS, disabled = false }: PhotoPickerProps) {
  const { colors } = useContext(ThemeContext);
  const { showToast } = useToast();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const remaining = max - photos.length;

  function addPhotos(assets: ImagePicker.ImagePickerAsset[]) {
    const accepted: PickedPhoto[] = [];
    let tooBig = 0;

    assets.forEach((asset, i) => {
      if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
        tooBig += 1;
        return;
      }
      const duplicated = photos.some(p => p.uri === asset.uri) || accepted.some(p => p.uri === asset.uri);
      if (duplicated) return;
      accepted.push(assetToPhoto(asset, photos.length + i));
    });

    if (tooBig > 0) {
      showToast(
        tooBig === 1 ? `Uma foto passa de ${MAX_PHOTO_MB} MB e não foi anexada.` : `${tooBig} fotos passam de ${MAX_PHOTO_MB} MB e não foram anexadas.`,
        'error',
      );
    }
    if (accepted.length > remaining) {
      showToast(`O limite é de ${max} fotos por chamado.`, 'info');
    }
    if (accepted.length > 0) {
      onChange([...photos, ...accepted].slice(0, max));
    }
  }

  async function openCamera() {
    try {
      let permission = await ImagePicker.getCameraPermissionsAsync();
      if (!permission.granted) permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        if (!permission.canAskAgain) {
          // o usuário negou "para sempre": só dá para liberar nas configurações do aparelho
          const openSettings = await confirmAction({
            title: 'Câmera bloqueada',
            message: 'Permita o acesso à câmera nas configurações do aparelho para tirar fotos.',
            confirmText: 'Abrir configurações',
          });
          if (openSettings) Linking.openSettings();
        } else {
          showToast('Precisamos de acesso à câmera para tirar a foto.', 'error');
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!result.canceled) addPhotos(result.assets);
    } catch (error) {
      showToast('Não foi possível abrir a câmera.', 'error');
    }
  }

  async function openGallery() {
    try {
      // o seletor do sistema não exige permissão de acesso à galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.6,
      });
      if (!result.canceled) addPhotos(result.assets);
    } catch (error) {
      showToast('Não foi possível abrir a galeria.', 'error');
    }
  }

  function handleAdd() {
    if (disabled) return;
    if (remaining <= 0) {
      showToast(`Você já anexou o máximo de ${max} fotos.`, 'info');
      return;
    }
    // na web o Alert com botões não funciona, então abre a galeria direto
    if (Platform.OS === 'web') {
      openGallery();
      return;
    }
    Alert.alert('Adicionar foto', 'Escolha a origem da imagem:', [
      { text: 'Câmera', onPress: openCamera },
      { text: 'Galeria', onPress: openGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <View>
      <View style={styles.grid}>
        {photos.map((photo, index) => (
          <View key={photo.uri} style={styles.thumbWrapper}>
            <TouchableOpacity
              onPress={() => setViewerIndex(index)}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Ver foto ${index + 1}`}
            >
              <Image source={{ uri: photo.uri }} style={[styles.thumb, { backgroundColor: colors.surfaceElevated }]} />
            </TouchableOpacity>
            {!disabled && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
                accessibilityRole="button"
                accessibilityLabel={`Remover foto ${index + 1}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {remaining > 0 && (
          <TouchableOpacity
            style={[styles.addTile, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, opacity: disabled ? 0.5 : 1 }]}
            onPress={handleAdd}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Adicionar foto"
          >
            <Feather name="camera" size={24} color={colors.accentSilver} />
            <Text style={[styles.addText, { color: colors.accentSilver }]}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.counter, { color: colors.textMuted }]}>
        {photos.length}/{max} fotos · até {MAX_PHOTO_MB} MB cada
      </Text>

      <PhotoViewer
        visible={viewerIndex !== null}
        uris={photos.map(p => p.uri)}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

const THUMB_SIZE = 96;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  thumbWrapper: { marginRight: 10, marginBottom: 10 },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 12 },
  removeButton: {
    position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(224, 108, 117, 0.95)', alignItems: 'center', justifyContent: 'center',
  },
  addTile: {
    width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  addText: { fontSize: 12, fontWeight: 'bold', marginTop: 6 },
  counter: { fontSize: 12 },
});
