// mobile/src/components/PhotoGallery.tsx
import React, { useContext, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import PhotoViewer from './PhotoViewer';

interface PhotoGalleryProps {
  urls: string[];
}

function GalleryThumb({ uri, index, onPress }: { uri: string; index: number; onPress: () => void }) {
  const { colors } = useContext(ThemeContext);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  return (
    <TouchableOpacity
      style={[styles.thumb, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
      onPress={onPress}
      disabled={state === 'error'}
      accessibilityRole="imagebutton"
      accessibilityLabel={`Ampliar foto ${index + 1}`}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        resizeMode="cover"
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
      />
      {state === 'loading' && <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.accentSilver} />}
      {state === 'error' && (
        <View style={[StyleSheet.absoluteFill, styles.errorBox]}>
          <Feather name="image" size={22} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>Falhou</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Fotos anexadas ao chamado: miniaturas na horizontal e visualizador em tela cheia.
export default function PhotoGallery({ urls }: PhotoGalleryProps) {
  const { colors } = useContext(ThemeContext);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (urls.length === 0) return null;

  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {urls.length === 1 ? 'Foto anexada' : `Fotos anexadas (${urls.length})`}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {urls.map((uri, index) => (
          <GalleryThumb key={uri} uri={uri} index={index} onPress={() => setViewerIndex(index)} />
        ))}
      </ScrollView>
      <Text style={[styles.hint, { color: colors.textMuted }]}>Toque em uma foto para ampliar</Text>

      <PhotoViewer
        visible={viewerIndex !== null}
        uris={urls}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  thumb: { width: 120, height: 120, borderRadius: 12, borderWidth: 1, marginRight: 10, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  errorBox: { alignItems: 'center', justifyContent: 'center' },
  hint: { fontSize: 12, marginTop: 8 },
});
