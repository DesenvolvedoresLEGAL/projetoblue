
/**
 * Utility functions for formatting data in a consistent way
 */

/**
 * Format a phone number to Brazilian format
 * Problem: Números exibidos sem máscara brasileira.
 * Solução: Formatar números como "(XX) XXXXX-XXXX" ou "(XX) XXXX-XXXX"
 */
export const formatPhoneNumber = (phone: string | number | undefined): string => {
  if (!phone) return 'N/A';
  const phoneStr = String(phone).replace(/\D/g, '');
  if (phoneStr.length === 11) {
    return `(${phoneStr.substring(0, 2)}) ${phoneStr.substring(2, 7)}-${phoneStr.substring(7)}`;
  } else if (phoneStr.length === 10) {
    return `(${phoneStr.substring(0, 2)}) ${phoneStr.substring(2, 6)}-${phoneStr.substring(6)}`;
  }
  return phoneStr;
};

/**
 * Format a date consistently
 * Problem: Formatação inconsistente, .toLocaleString().replace(',', '').
 * Solução: Centralizar formatação de datas
 */
interface DateFormatOptions {
  showTime?: boolean;
  shortMonth?: boolean;
}

export const formatDate = (date: string | Date | undefined, options: DateFormatOptions = {}): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    const { showTime = false, shortMonth = false } = options;
    
    if (showTime) {
      return dateObj.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: shortMonth ? 'short' : '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Capitalize a string consistently
 * Problem: Uso disperso/inconsistente de .capitalize().
 * Solução: Criar helper capitalize(str) universal
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get appropriate asset identifier
 * Problem: Duplicidade de Identificadores
 * Solução: Exibir o identificador de forma consistente
 * 
 * Updated: agora usando line_number para CHIPs e radio para outros equipamentos
 */
export const getAssetIdentifier = (asset: any): string => {
  if (!asset) return 'N/A';
  
  // Para CHIPs, usar o número da linha como identificador
  if ((asset.solution_id === 11 || asset.type === 'CHIP' || asset.solucao === 'CHIP') && asset.line_number) {
    return String(asset.line_number);
  }
  
  // Para outros equipamentos, usar o campo radio
  if (asset.radio) {
    return asset.radio;
  }
  
  // Fallbacks em ordem de prioridade
  return asset.serial_number || 
         (asset.uuid ? asset.uuid.substring(0, 8) : 'N/A');
};
