// mobile/src/components/PhotoViewer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, Modal, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PhotoViewerProps {
  uris: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

// Visualizador em tela cheia: desliza para os lados para trocar de foto.
export default function PhotoViewer({ uris, initialIndex, visible, onClose }: PhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.background}>
        <FlatList
          data={uris}
          keyExtractor={(uri) => uri}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.min(initialIndex, Math.max(uris.length - 1, 0))}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <View style={{ width, height, justifyContent: 'center' }}>
              <Image source={{ uri: item }} style={{ width, height: height * 0.8 }} resizeMode="contain" />
            </View>
          )}
        />

        <View style={styles.topBar} pointerEvents="box-none">
          {uris.length > 1 ? <Text style={styles.counter}>{index + 1} / {uris.length}</Text> : <View />}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar visualização da foto"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  topBar: {
    position: 'absolute', top: 50, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  counter: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  closeButton: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
});
