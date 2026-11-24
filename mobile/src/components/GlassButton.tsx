import React, { useRef, useContext } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { ThemeContext } from '../contexts/ThemeContext';
import { SPACING } from '../theme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost';
  style?: ViewStyle;
}

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',
  style,
}: GlassButtonProps) {
  const { colors } = useContext(ThemeContext);

  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const getBackground = () => {
    if (variant === 'primary') return colors.accentSilver;
    if (variant === 'danger') return 'rgba(224, 108, 117, 0.15)';
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary') return colors.background;
    if (variant === 'danger') return colors.statusDanger;
    return colors.textPrimary;
  };

  return (
    <Animated.View style={[styles.animatedContainer, { transform: [{ scale }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: getBackground(),
            borderColor:
              variant === 'primary'
                ? 'rgba(255,255,255,0.4)'
                : colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: variant === 'primary' ? 0.2 : 0,
            shadowRadius: 8,
            elevation: variant === 'primary' ? 4 : 0,
          },
        ]}
      >
        <Text style={[styles.text, { color: getTextColor() }]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    width: '100%',
  },

  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});