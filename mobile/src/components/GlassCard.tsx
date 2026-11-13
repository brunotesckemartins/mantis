// mobile/src/components/GlassCard.tsx
import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemeContext } from '../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function GlassCard({ children, onPress, style }: GlassCardProps) {
  const { isDark } = useContext(ThemeContext);

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.container, style]}>
      <CardWrapper onPress={onPress} activeOpacity={0.7} style={styles.wrapper}>
        <BlurView 
          intensity={isDark ? 30 : 60} 
          tint={isDark ? 'dark' : 'light'} 
          style={styles.blur}
        >
          {children}
        </BlurView>
      </CardWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 24,
    // Sombra sutil estilo iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  blur: {
    width: '100%',
    // Borda interna iluminada (Glass Stroke)
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
  }
});