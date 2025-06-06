
import { ClientRegistrationFormData } from '@/modules/clients/hooks/useClientRegistrationState';

export function useClientFormValidation(formData: ClientRegistrationFormData) {
  const isFormValid = formData.empresa.trim().length >= 2 && 
                     formData.responsavel.trim().length >= 2 &&
                     formData.telefones.some(tel => tel.trim().length >= 10);

  return { isFormValid };
}
