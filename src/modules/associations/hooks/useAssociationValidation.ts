
import { useIdempotentAssociation } from './useIdempotentAssociation';

export const useAssociationValidation = () => {
  const { executeWithIdempotency, isOperationExecuting } = useIdempotentAssociation();

  const validateAssociation = async (data: any) => {
    return executeWithIdempotency(
      `validate_association_${data.clientId}`,
      async () => {
        // Lógica de validação aqui
        console.log('Validando associação:', data);
        return { valid: true };
      }
    );
  };

  return {
    validateAssociation,
    isValidating: isOperationExecuting('validate_association')
  };
};
