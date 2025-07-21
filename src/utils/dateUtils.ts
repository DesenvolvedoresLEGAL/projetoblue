
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Corrige problema de data -1 dia ao trabalhar com datas ISO
 * Garante que a data local seja preservada independente do timezone
 */
export const formatDateForDisplay = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  
  try {
    let date: Date;
    
    if (typeof dateInput === 'string') {
      // Se é string YYYY-MM-DD, criar data local
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateInput.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        // Para outros formatos, usar parseISO
        date = parseISO(dateInput);
      }
    } else {
      date = dateInput;
    }
    
    if (!isValid(date)) {
      
      return dateInput.toString();
    }
    
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    
    return dateInput?.toString() || '-';
  }
};

/**
 * Formata data com hora para exibição
 */
export const formatDateTimeForDisplay = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  
  try {
    let date: Date;
    
    if (typeof dateInput === 'string') {
      date = parseISO(dateInput);
    } else {
      date = dateInput;
    }
    
    if (!isValid(date)) {
      
      return dateInput.toString();
    }
    
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    
    return dateInput?.toString() || '-';
  }
};

/**
 * Converte data para formato ISO sem problemas de timezone
 */
export const formatDateForSubmission = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Valida se duas datas estão em ordem cronológica correta
 */
export const validateDateRange = (startDate: Date | null, endDate: Date | null): string | null => {
  if (!startDate || !endDate) return null;
  
  if (startDate > endDate) {
    return 'A data de início deve ser anterior à data de fim';
  }
  
  return null;
};
