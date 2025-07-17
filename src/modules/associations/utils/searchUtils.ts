
export interface SearchResult {
  type: 'client_name' | 'iccid' | 'radio';
  term: string;
  matchCount: number;
}

export const detectSearchType = (searchTerm: string): SearchResult['type'] => {
  const trimmed = searchTerm.trim();
  
  if (!trimmed) return 'client_name';
  
  // Detecta ICCID (19-20 dígitos ou últimos 5 dígitos)
  if (/^\d{0,6}$/.test(trimmed) || /^\d{19,20}$/.test(trimmed)) {
    return 'iccid';
  }
  if (/^[A-Za-z0-9\-_]+$/.test(trimmed) && trimmed.length <= 20 && !trimmed.includes(' ')) {
  
  // Detecta RADIO (alfanumérico sem espaços, até 20 caracteres)
    return 'radio';
  }
  
  // Default: nome do cliente
  return 'client_name';
};

export const highlightText = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
};

export const searchInText = (text: string, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

export const searchInICCID = (iccid: string | null, searchTerm: string): boolean => {
  if (!iccid || !searchTerm.trim()) return false;
  
  const term = searchTerm.toLowerCase();
  const iccidLower = iccid.toLowerCase();
  
  // Busca completa
  if (iccidLower.includes(term)) return true;
  
  // Busca pelos últimos 5 dígitos se o termo tiver 5 dígitos
  if (/^\d{5}$/.test(term) && iccid.length >= 5) {
    return iccid.slice(-5) === term;
  }
  
  return false;
};
