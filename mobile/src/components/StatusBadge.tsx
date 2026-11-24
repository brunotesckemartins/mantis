// mobile/src/components/StatusBadge.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';
import { getStatusColor, getStatusLabel } from '../utils/ticketStatus';

interface StatusBadgeProps {
  status?: string | null;
  style?: ViewStyle;
}

// Etiqueta colorida padrão para o status do chamado
export default function StatusBadge({ status, style }: StatusBadgeProps) {
  const { colors } = useContext(ThemeContext);
  const color = getStatusColor(status, colors);

  return (
    <View
      style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}40` }, style]}
      accessibilityLabel={`Status: ${getStatusLabel(status)}`}
    >
      <Text style={[styles.text, { color }]}>{getStatusLabel(status).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  text: { fontSize: 11, fontWeight: 'bold' },
});
