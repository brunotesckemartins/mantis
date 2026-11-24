// mobile/src/utils/photos.ts
// Regras e helpers dos anexos (fotos) dos chamados.
import { Platform } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB por foto
export const MAX_PHOTO_MB = MAX_PHOTO_BYTES / (1024 * 1024);

export interface PickedPhoto {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  gif: 'image/gif',
};

function getExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

// Converte o resultado do ImagePicker no formato usado pelo app.
export function assetToPhoto(asset: ImagePickerAsset, index: number): PickedPhoto {
  // na web a uri é um blob:/data:, então o nome vem do próprio arquivo ou é gerado
  const isTemporaryUri = asset.uri.startsWith('blob:') || asset.uri.startsWith('data:');
  const nameFromUri = isTemporaryUri ? '' : (asset.uri.split('/').pop() || '').split('?')[0];

  let name = asset.fileName || nameFromUri || `foto-${Date.now()}-${index}`;
  if (!getExtension(name)) name = `${name}.jpg`;

  const type = asset.mimeType && asset.mimeType.startsWith('image/')
    ? asset.mimeType
    : (MIME_BY_EXTENSION[getExtension(name)] || 'image/jpeg');

  return { uri: asset.uri, name, type, size: asset.fileSize };
}

// Adiciona as fotos no FormData no formato que o Rails espera (ticket[photos][]).
export async function appendPhotos(formData: FormData, photos: PickedPhoto[], field = 'ticket[photos][]'): Promise<void> {
  for (const photo of photos) {
    if (Platform.OS === 'web') {
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      formData.append(field, blob, photo.name);
    } else {
      formData.append(field, { uri: photo.uri, name: photo.name, type: photo.type } as any);
    }
  }
}
