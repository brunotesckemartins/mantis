// mobile/src/components/GlassButton.tsx
import React, { useRef, useContext } from 'react';
import { Animated, Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
  style?: ViewStyle;
}

export default function GlassButton({ title, onPress, variant = 'primary', style }: GlassButtonProps) {
  const { colors } = useContext(ThemeContext);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, friction: 5 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  const getBackground = () => {
    if (variant === 'primary') return colors.accentSilver;
    if (variant === 'danger') return 'rgba(224, 108, 117, 0.15)'; // Vermelho suave
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary') return colors.background;
    if (variant === 'danger') return colors.statusDanger;
    return colors.textPrimary;
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.button,
          { 
            backgroundColor: getBackground(),
            // GLASS STROKE: Borda interna iluminada
            borderWidth: 1,
            borderColor: variant === 'primary' ? 'rgba(255,255,255,0.4)' : colors.border,
            // Sombra sutil para o efeito de flutuação (iOS style)
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: variant === 'primary' ? 0.2 : 0,
            shadowRadius: 8,
            elevation: variant === 'primary' ? 4 : 0,
          }
        ]}
      >
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16, // Arredondamento estilo iOS
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  }
});