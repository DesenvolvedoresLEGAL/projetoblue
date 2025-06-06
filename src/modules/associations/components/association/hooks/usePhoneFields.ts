
import { useState } from 'react';
import { formatPhoneNumber } from '@/utils/phoneFormatter';

export function usePhoneFields(initialPhones: string[]) {
  const [phones, setPhones] = useState<string[]>(initialPhones);

  const addPhoneField = () => {
    setPhones(prev => [...prev, '']);
  };

  const removePhoneField = (index: number) => {
    setPhones(prev => prev.filter((_, i) => i !== index));
  };

  const updatePhone = (index: number, value: string) => {
    // Remove formatação para validação e armazenamento
    const cleanValue = value.replace(/\D/g, '');
    // Aplica formatação apenas para exibição
    const formattedValue = formatPhoneNumber(cleanValue);
    
    setPhones(prev => prev.map((tel, i) => i === index ? formattedValue : tel));
  };

  return {
    phones,
    setPhones,
    addPhoneField,
    removePhoneField,
    updatePhone
  };
}
