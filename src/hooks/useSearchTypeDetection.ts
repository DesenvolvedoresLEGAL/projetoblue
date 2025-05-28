
import { useMemo } from 'react';

export type SearchType = 'iccid' | 'radio' | 'client_name' | 'empty';

export const useSearchTypeDetection = (searchTerm: string): SearchType => {
  return useMemo(() => {
    const trimmed = searchTerm.trim();
    
    if (!trimmed) return 'empty';
    
    // Detecta se é um numérico
    if (/^\d+$/.test(trimmed)) {
      return 'iccid';
    }
    
    // Detecta se é ICCID (padrão: 19-20 dígitos)
    if (/^\d{19,20}$/.test(trimmed)) {
      return 'iccid';
    }
    
    // Detecta se é rádio (padrão comum: letras + números)
    if (/^[A-Za-z\-_]+$/.test(trimmed) && trimmed.length <= 20) {
      return 'client_name';
    }
    
    if (/^[A-Za-z0-9\-_]+$/.test(trimmed) && trimmed.length <= 20) {
      // Detecta se é rádio (padrão comum: letras + números)
      return 'radio';
    }

    
    // Padrão: assume que é nome de cliente
    return 'client_name';
  }, [searchTerm]);
};
