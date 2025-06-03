
export const formatPhoneNumber = (phone: string | number): string => {
  if (!phone) return '';
  
  // Converte para string e trata notação científica
  let phoneStr = '';
  if (typeof phone === 'number') {
    // Converte número para string sem notação científica
    phoneStr = phone.toFixed(0);
  } else {
    phoneStr = phone.toString();
  }
  
  // Remove todos os caracteres não numéricos
  const cleanPhone = phoneStr.replace(/\D/g, '');
  
  // Não formatar se muito curto
  if (cleanPhone.length < 8) {
    return cleanPhone;
  }
  
  // Se tem 11 dígitos (celular com DDD)
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 3)} ${cleanPhone.slice(3, 7)}-${cleanPhone.slice(7)}`;
  }
  
  // Se tem 10 dígitos (fixo com DDD)
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }
  
  // Se tem 9 dígitos (celular sem DDD)
  if (cleanPhone.length === 9) {
    return `${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1, 5)}-${cleanPhone.slice(5)}`;
  }
  
  // Se tem 8 dígitos (fixo sem DDD)
  if (cleanPhone.length === 8) {
    return `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4)}`;
  }
  
  // Retorna o número original se não se encaixa nos padrões
  return cleanPhone;
};

export const normalizePhoneForSearch = (phone: string): string => {
  // Remove todos os caracteres não numéricos para busca
  return phone.replace(/\D/g, '');
};

// Função para formatar telefone para armazenamento (apenas números)
export const formatPhoneForStorage = (phone: string): string => {
  // Remove todos os caracteres não numéricos para armazenamento
  return phone.replace(/\D/g, '');
};

// Nova função para converter notação científica
export const parsePhoneFromScientific = (phone: string | number): string => {
  if (!phone) return '';
  
  if (typeof phone === 'number') {
    // Converte número para string sem notação científica
    return phone.toFixed(0);
  }
  
  // Se é string mas parece notação científica (ex: "1.1999999e+10")
  if (typeof phone === 'string' && phone.includes('e+')) {
    const numericValue = parseFloat(phone);
    if (!isNaN(numericValue)) {
      return numericValue.toFixed(0);
    }
  }
  
  return phone.toString();
};

// Função para validar se o telefone tem formato válido
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 8 && cleanPhone.length <= 11;
};
