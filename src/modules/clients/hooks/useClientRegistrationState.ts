
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from '@/hooks/useDebounce';

export interface ClientRegistrationFormData {
  empresa: string;
  responsavel: string;
  telefones: string[];
  email: string;
  cnpj: string;
}

const STORAGE_KEY = 'register-client-form-draft';

const defaultFormData: ClientRegistrationFormData = {
  empresa: '',
  responsavel: '',
  telefones: [''],
  email: '',
  cnpj: ''
};

export function useClientRegistrationState() {
  const [formData, setFormData] = useState<ClientRegistrationFormData>(defaultFormData);
  const [isFormDataLoaded, setIsFormDataLoaded] = useState(false);
  
  // Debounce form data for sessionStorage saving
  const debouncedFormData = useDebounce(formData, 500);

  // Load data from sessionStorage on mount
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        setFormData(parsedData);
      }
    } catch (error) {
      return error;
    } finally {
      setIsFormDataLoaded(true);
    }
  }, []);

  // Save debounced data to sessionStorage
  useEffect(() => {
    if (!isFormDataLoaded) return;
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedFormData));
      
    } catch (error) {
      return error;
    }
  }, [debouncedFormData, isFormDataLoaded]);

  const updateField = useCallback((field: keyof ClientRegistrationFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFormData = useCallback((newData: Partial<ClientRegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  const clearState = useCallback(() => {
    
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setFormData(defaultFormData);
    } catch (error) {
      return error;
    }
  }, []);

  // Phone management functions
  const addPhoneField = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, '']
    }));
  }, []);

  const removePhoneField = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.filter((_, i) => i !== index)
    }));
  }, []);

  const updatePhone = useCallback((index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.map((tel, i) => i === index ? value : tel)
    }));
  }, []);

  return {
    formData,
    isFormDataLoaded,
    updateField,
    updateFormData,
    clearState,
    addPhoneField,
    removePhoneField,
    updatePhone
  };
}
