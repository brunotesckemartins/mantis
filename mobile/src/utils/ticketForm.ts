// mobile/src/utils/ticketForm.ts
// Regras e constantes do formulário de abertura de chamado.

export const TITLE_MIN = 5;
export const TITLE_MAX = 100;
export const DESCRIPTION_MIN = 10;
export const DESCRIPTION_MAX = 1000;

export type PriorityValue = 'baixa' | 'media' | 'alta' | 'critica';

export interface PriorityOption {
  value: PriorityValue;
  label: string;
  hint: string;
}

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: 'baixa', label: 'Baixa', hint: 'Não atrapalha o trabalho, pode esperar.' },
  { value: 'media', label: 'Média', hint: 'Atrapalha, mas existe um jeito de contornar.' },
  { value: 'alta', label: 'Alta', hint: 'Impede o trabalho de uma pessoa ou de um setor.' },
  { value: 'critica', label: 'Crítica', hint: 'Serviço parado e afetando várias pessoas.' },
];

export interface TicketFormValues {
  title: string;
  description: string;
  categoryId: string;
}

export type TicketFormErrors = Partial<Record<keyof TicketFormValues, string>>;

// Valida os campos obrigatórios. Retorna um objeto vazio quando está tudo certo.
export function validateTicketForm(values: TicketFormValues): TicketFormErrors {
  const errors: TicketFormErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (!title) {
    errors.title = 'Informe um título para o chamado.';
  } else if (title.length < TITLE_MIN) {
    errors.title = `O título precisa ter pelo menos ${TITLE_MIN} caracteres.`;
  }

  if (!description) {
    errors.description = 'Descreva o problema.';
  } else if (description.length < DESCRIPTION_MIN) {
    errors.description = `Dê mais detalhes (mínimo de ${DESCRIPTION_MIN} caracteres).`;
  }

  if (!values.categoryId) {
    errors.categoryId = 'Selecione uma categoria.';
  }

  return errors;
}
