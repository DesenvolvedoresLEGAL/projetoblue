
import { useState, useEffect, useCallback } from "react";

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

  // Load data from sessionStorage on mount
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('[ClientRegistrationState] Loaded data from sessionStorage:', parsedData);
        setFormData(parsedData);
      }
    } catch (error) {
      console.error('[ClientRegistrationState] Error loading from sessionStorage:', error);
    } finally {
      setIsFormDataLoaded(true);
    }
  }, []);

  // Save data to sessionStorage whenever formData changes
  useEffect(() => {
    if (!isFormDataLoaded) return; // Don't save until initial load is complete
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      console.log('[ClientRegistrationState] Saved data to sessionStorage:', formData);
    } catch (error) {
      console.error('[ClientRegistrationState] Error saving to sessionStorage:', error);
    }
  }, [formData, isFormDataLoaded]);

  const updateFormData = useCallback((newData: Partial<ClientRegistrationFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  const clearState = useCallback(() => {
    console.log('[ClientRegistrationState] Clearing state and sessionStorage');
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      setFormData(defaultFormData);
    } catch (error) {
      console.error('[ClientRegistrationState] Error clearing sessionStorage:', error);
    }
  }, []);

  const syncWithForm = useCallback((formValues: ClientRegistrationFormData) => {
    console.log('[ClientRegistrationState] Syncing with form values:', formValues);
    setFormData(formValues);
  }, []);

  return {
    formData,
    isFormDataLoaded,
    updateFormData,
    clearState,
    syncWithForm
  };
}
