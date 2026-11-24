// mobile/src/utils/apiError.ts
// Converte um erro do axios em uma mensagem que pode ser mostrada ao usuário.

export function getApiErrorMessage(error: any, fallback: string): string {
  // sem resposta do servidor: sem internet ou API fora do ar
  if (error?.request && !error?.response) {
    return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.';
  }

  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) return data.errors.join(' ');
  if (typeof data?.error === 'string' && data.error) return data.error;
  if (typeof data?.message === 'string' && data.message) return data.message;

  return fallback;
}
