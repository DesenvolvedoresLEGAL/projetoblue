
export const formatPhoneNumber = (phone: string | number): string => {
  if (!phone) return '';
  
  // Converte para string e remove todos os caracteres não numéricos
  const cleanPhone = phone.toString().replace(/\D/g, '');
  
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
