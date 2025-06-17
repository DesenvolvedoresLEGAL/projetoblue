
import { translateError } from "@/utils/errorTranslator";
import { toast } from "@/utils/toast";

// Handle and translate asset-related errors
export const handleAssetError = (error: any, context: string) => {
  console.error(`[Asset Error - ${context}]:`, error);
  
  // Use the error translator for user-friendly messages
  const userMessage = translateError(error, { 
    action: context.includes('create') ? 'create' : 
           context.includes('update') ? 'update' : 
           context.includes('delete') ? 'delete' : 'fetch',
    entity: 'o ativo'
  });
  
  // Don't show toast here since it's handled by the calling function
  // This function is mainly for logging and context
  return userMessage;
};

// Validate asset data before operations
export const validateAssetData = (assetData: any): string | null => {
  if (!assetData) {
    return "Dados do ativo são obrigatórios";
  }
  
  // Add more specific validations as needed
  if (assetData.type === 'CHIP' && !assetData.iccid) {
    return "ICCID é obrigatório para chips";
  }
  
  if (assetData.type === 'ROTEADOR' && !assetData.radio) {
    return "Número do rádio é obrigatório para equipamentos";
  }
  
  return null;
};
