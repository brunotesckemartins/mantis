// mobile/src/components/StatusTimeline.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { STATUS_STEPS, formatDateTime, getStatusColor } from '../utils/ticketStatus';

interface StatusTimelineProps {
  ticket: any;
}

type StepState = 'done' | 'current' | 'todo';

// Linha do tempo vertical: Aberto -> Em atendimento -> Resolvido
export default function StatusTimeline({ ticket }: StatusTimelineProps) {
  const { colors } = useContext(ThemeContext);

  const currentIndex = Math.max(0, STATUS_STEPS.findIndex(s => s.value === ticket.status));
  const isResolved = ticket.status === 'resolvido';

  function getSubtitle(step: string, state: StepState): string {
    if (step === 'aberto') return formatDateTime(ticket.created_at);
    if (step === 'em_atendimento') {
      if (state === 'todo') return 'Aguardando um técnico assumir';
      return ticket.technician?.name ? `Técnico: ${ticket.technician.name}` : 'Em atendimento';
    }
    if (state === 'todo') return 'Aguardando a solução';
    return formatDateTime(ticket.resolved_at);
  }

  return (
    <View accessibilityLabel="Acompanhamento do status do chamado">
      {STATUS_STEPS.map((step, index) => {
        // quando o chamado está resolvido, todas as etapas ficam concluídas
        let state: StepState = 'todo';
        if (index < currentIndex || (index === currentIndex && isResolved)) state = 'done';
        else if (index === currentIndex) state = 'current';

        const color = state === 'todo' ? colors.textMuted : getStatusColor(step.value, colors);
        const isLast = index === STATUS_STEPS.length - 1;
        const subtitle = getSubtitle(step.value, state);

        return (
          <View key={step.value} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  { borderColor: color, backgroundColor: state === 'done' ? color : 'transparent' },
                ]}
              >
                {state === 'done' && <Feather name="check" size={13} color={colors.background} />}
                {state === 'current' && <View style={[styles.innerDot, { backgroundColor: color }]} />}
              </View>
              {!isLast && (
                <View style={[styles.line, { backgroundColor: index < currentIndex ? color : colors.border }]} />
              )}
            </View>

            <View style={[styles.content, isLast && { paddingBottom: 0 }]}>
              <Text style={[styles.label, { color: state === 'todo' ? colors.textMuted : colors.textPrimary, fontWeight: state === 'current' ? 'bold' : '600' }]}>
                {step.label}
              </Text>
              {!!subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  rail: { alignItems: 'center', width: 26 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  innerDot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, flex: 1, marginVertical: 2 },
  content: { flex: 1, marginLeft: 12, paddingBottom: 18 },
  label: { fontSize: 15 },
  subtitle: { fontSize: 12, marginTop: 2 },
});
