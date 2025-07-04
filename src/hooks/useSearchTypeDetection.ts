
import { useMemo } from 'react';

export type SearchType = 'id' | 'iccid' | 'radio' | 'client_name' | 'empty';

export const useSearchTypeDetection = (searchTerm: string): SearchType => {
  return useMemo(() => {
    const trimmed = searchTerm.trim();
    
    if (!trimmed) return 'empty';
    
    // Detecta se é ICCID (padrão: 19-20 dígitos)
    if (/^\d{19,20}$/.test(trimmed)) {
      return 'iccid';
    }
    
    // Detecta nome de cliente quando possui espaços ou excede o tamanho máximo de rádio
    if (/^[A-Za-z\-_ ]+$/.test(trimmed) && (trimmed.length > 20 || /\s/.test(trimmed))) {
      return 'client_name';
    }
    
    if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(trimmed) && trimmed.length <= 20) {
      // Detecta se é rádio (padrão comum: letras + números)
      return 'radio';
    }

    
    // Padrão: assume que é nome de cliente
    return 'client_name';
  }, [searchTerm]);
};
