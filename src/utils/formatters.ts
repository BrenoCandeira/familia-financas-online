/**
 * Formata um número para o formato de moeda brasileira
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda (ex: R$ 1.234,56)
 */
export const formatCurrency = (value: number): string => {
  if (isNaN(value)) return "R$ 0,00";
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Converte uma string de moeda para número
 * @param value - String no formato de moeda (ex: R$ 1.234,56)
 * @returns Número convertido
 */
export const parseCurrency = (value: string): number => {
  // Remove todos os caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '');
  
  // Se não houver valor, retorna 0
  if (!cleanValue) return 0;
  
  // Se houver mais de uma vírgula ou ponto, mantém apenas o último
  const parts = cleanValue.split(/[.,]/);
  if (parts.length > 2) {
    const lastPart = parts.pop();
    const firstPart = parts.join('');
    return parseFloat(`${firstPart}.${lastPart}`);
  }
  
  // Se houver apenas uma vírgula ou ponto, converte para ponto
  const normalizedValue = cleanValue.replace(',', '.');
  return parseFloat(normalizedValue);
};

/**
 * Formata um valor para exibição em input de moeda
 * @param value - String com o valor a ser formatado
 * @returns String formatada para exibição
 */
export const formatCurrencyInput = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Se não houver números, retorna vazio
  if (!numbers) return '';
  
  // Converte para número e formata
  const amount = parseFloat(numbers) / 100;
  return formatCurrency(amount);
};

/**
 * Formata um número para o formato percentual
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como percentual (ex: 12,34%)
 */
export const formatPercent = (value: number): string => {
  if (isNaN(value)) return "0,00%";
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};

/**
 * Formata uma data para o formato brasileiro
 * @param date - Data a ser formatada
 * @returns String formatada como data (ex: 31/12/2023)
 */
export const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return "";
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

/**
 * Formata uma data e hora para o formato brasileiro
 * @param date - Data a ser formatada
 * @returns String formatada como data e hora (ex: 31/12/2023 23:59)
 */
export const formatDateTime = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return "";
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Calcula o progresso percentual
 * @param current - Valor atual
 * @param target - Valor alvo
 * @returns Número entre 0 e 100 representando o progresso
 */
export const calculateProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(100, Math.max(0, progress));
};

/**
 * Formata uma data para exibição amigável (hoje, ontem, dd/mm)
 */
export const formatDateFriendly = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObject = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObject.getTime())) return '';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateToCompare = new Date(dateObject);
  dateToCompare.setHours(0, 0, 0, 0);
  
  if (dateToCompare.getTime() === today.getTime()) {
    return 'Hoje';
  }
  
  if (dateToCompare.getTime() === yesterday.getTime()) {
    return 'Ontem';
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(dateObject);
};

/**
 * Retorna um estilo de cor com base no tipo de transação
 */
export const getTransactionTypeColor = (type: 'entrada' | 'saída'): string => {
  return type === 'entrada' ? 'text-financial-income' : 'text-financial-expense';
};

/**
 * Formata o número de parcelas (ex: 3/12)
 */
export const formatInstallment = (current: number, total: number): string => {
  return `${current}/${total}`;
};
