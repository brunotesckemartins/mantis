
import React, { useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';

import { ThemeContext } from '../contexts/ThemeContext';
import { SPACING } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function GlassCard({
  children,
  onPress,
  style,
}: GlassCardProps) {
  const { isDark, colors } = useContext(ThemeContext);

  const cardContent = (
    <BlurView
      intensity={isDark ? 30 : 60}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.blur,
        { borderColor: colors.border },
      ]}
    >
      {children}
    </BlurView>
  );

  return (
    <View style={[styles.container, style]}>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={styles.wrapper}
        >
          {cardContent}
        </TouchableOpacity>
      ) : (
        <View style={styles.wrapper}>
          {cardContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.borderRadius,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  wrapper: {
    borderRadius: SPACING.borderRadius,
    overflow: 'hidden',
  },

  blur: {
    width: '100%',
    borderWidth: 1,
    borderRadius: SPACING.borderRadius,
  },
});
