
interface ErrorTranslation {
  message: string;
  action?: string;
}

export const translateSupabaseError = (error: any): ErrorTranslation => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || '';
  
  // Erros de constraint específicos
  if (errorMessage.includes('assets_iccid_key') || errorMessage.includes('duplicate key value violates unique constraint')) {
    if (errorMessage.includes('iccid')) {
      return {
        message: "Já existe um ativo cadastrado com esse ICCID.",
        action: "Verifique o número do ICCID e tente novamente."
      };
    }
    if (errorMessage.includes('serial_number')) {
      return {
        message: "Já existe um ativo cadastrado com esse número de série.",
        action: "Verifique o número de série e tente novamente."
      };
    }
    return {
      message: "Já existe um registro com essas informações.",
      action: "Verifique os dados inseridos e tente novamente."
    };
  }

  // Erros de chave estrangeira
  if (errorMessage.includes('foreign key constraint') || errorMessage.includes('violates foreign key')) {
    return {
      message: "Não foi possível realizar a operação devido a vínculos com outros registros.",
      action: "Verifique se todos os dados relacionados estão corretos."
    };
  }

  // Erros de NOT NULL
  if (errorMessage.includes('null value') || errorMessage.includes('not-null constraint')) {
    return {
      message: "Há campos obrigatórios que não foram preenchidos.",
      action: "Preencha todos os campos obrigatórios e tente novamente."
    };
  }

  // Erros de RLS/Permissão
  if (errorMessage.includes('row-level security') || 
      errorMessage.includes('permission denied') || 
      errorMessage.includes('insufficient privilege') ||
      errorCode === 'PGRST301') {
    return {
      message: "Você não tem permissão para realizar esta ação.",
      action: "Entre em contato com o administrador do sistema se precisar de acesso."
    };
  }

  // Erros de autenticação
  if (errorMessage.includes('invalid_credentials') || 
      errorMessage.includes('authentication failed') ||
      errorMessage.includes('invalid login credentials')) {
    return {
      message: "Credenciais inválidas.",
      action: "Verifique seu email e senha e tente novamente."
    };
  }

  // Erros de email já cadastrado
  if (errorMessage.includes('user_already_registered') || 
      errorMessage.includes('email already registered')) {
    return {
      message: "Este email já está cadastrado no sistema.",
      action: "Tente fazer login ou use outro email para cadastro."
    };
  }

  // Erros de conexão/rede
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') || 
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection')) {
    return {
      message: "Problema de conexão com o servidor.",
      action: "Verifique sua conexão com a internet e tente novamente."
    };
  }

  // Erros de associação já existente
  if (errorMessage.includes('já está associado') || 
      errorMessage.includes('asset already associated')) {
    return {
      message: "Este ativo já está associado a outro cliente.",
      action: "Verifique se o ativo está disponível ou escolha outro."
    };
  }

  // Erro genérico
  return {
    message: "Ocorreu um erro inesperado ao processar sua solicitação.",
    action: "Tente novamente mais tarde ou entre em contato com o suporte."
  };
};

export const showFriendlyError = (error: any, customMessage?: string) => {
  const { toast } = require('@/utils/toast');
  
  if (customMessage) {
    toast.error(customMessage);
    return;
  }
  
  const translation = translateSupabaseError(error);
  const fullMessage = translation.action 
    ? `${translation.message} ${translation.action}`
    : translation.message;
    
  toast.error(fullMessage);
};
