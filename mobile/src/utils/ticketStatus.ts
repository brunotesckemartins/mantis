// mobile/src/utils/ticketStatus.ts
// Rótulos, cores e formatação de datas dos chamados (usados na lista, home e detalhes).
import { ThemeColors } from '../theme';

export type TicketStatus = 'aberto' | 'em_atendimento' | 'resolvido';

export const STATUS_STEPS: { value: TicketStatus; label: string }[] = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_atendimento', label: 'Em atendimento' },
  { value: 'resolvido', label: 'Resolvido' },
];

export const STATUS_FILTERS: { value: '' | TicketStatus; label: string }[] = [
  { value: '', label: 'Todos' },
  ...STATUS_STEPS,
];

export function getStatusLabel(status?: string | null): string {
  const found = STATUS_STEPS.find(s => s.value === status);
  if (found) return found.label;
  if (!status) return 'Desconhecido';
  // status novo que o app ainda não conhece: deixa legível
  const text = status.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function getStatusColor(status: string | null | undefined, colors: ThemeColors): string {
  if (status === 'aberto') return colors.statusWarning;
  if (status === 'em_atendimento') return colors.statusInfo;
  if (status === 'resolvido') return colors.statusSuccess;
  return colors.textSecondary;
}

const PRIORITY_LABELS: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export function getPriorityLabel(priority?: string | null): string {
  if (!priority) return '-';
  return PRIORITY_LABELS[priority] || priority;
}

export function getPriorityColor(priority: string | null | undefined, colors: ThemeColors): string {
  if (priority === 'baixa') return colors.statusSuccess;
  if (priority === 'media') return colors.statusInfo;
  if (priority === 'alta') return colors.statusWarning;
  if (priority === 'critica') return colors.statusDanger;
  return colors.textSecondary;
}

const pad = (n: number) => String(n).padStart(2, '0');

function toDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return isNaN(date.getTime()) ? null : date;
}

// dd/mm/aaaa (feito na mão para não depender do Intl de cada plataforma)
export function formatDate(iso?: string | null): string {
  const d = toDate(iso);
  if (!d) return '';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// dd/mm/aaaa às HH:mm
export function formatDateTime(iso?: string | null): string {
  const d = toDate(iso);
  if (!d) return '';
  return `${formatDate(iso)} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
