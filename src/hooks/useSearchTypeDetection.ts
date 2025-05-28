
import { useMemo } from 'react';

export type SearchType = 'id' | 'iccid' | 'radio' | 'client_name' | 'empty';

export const useSearchTypeDetection = (searchTerm: string): SearchType => {
  return useMemo(() => {
    const trimmed = searchTerm.trim();
    
    if (!trimmed) return 'empty';
    
    // Detecta se é um ID numérico
    if (/^\d+$/.test(trimmed)) {
      return 'id';
    }
    
    // Detecta se é ICCID (padrão: 19-20 dígitos)
    if (/^\d{19,20}$/.test(trimmed)) {
      return 'iccid';
    }
    
    // Detecta se é rádio (padrão comum: letras + números)
    if (/^[A-Za-z0-9\-_]+$/.test(trimmed) && trimmed.length <= 20) {
      return 'radio';
    }
    
    // Padrão: assume que é nome de cliente
    return 'client_name';
  }, [searchTerm]);
};
