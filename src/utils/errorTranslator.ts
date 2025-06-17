
/**
 * Utilitário para traduzir erros técnicos em mensagens amigáveis ao usuário
 */

export interface ErrorContext {
  action?: string;
  entity?: string;
  field?: string;
}

export const translateError = (error: any, context?: ErrorContext): string => {
  const errorMessage = error?.message || error?.toString() || '';
  const errorCode = error?.code || '';
  
  // Logs técnicos para debugging (não expostos ao usuário)
  console.error('[Error Translator]', {
    original: error,
    message: errorMessage,
    code: errorCode,
    context
  });

  // Erros de autenticação
  if (errorMessage.includes('Invalid login credentials') || 
      errorMessage.includes('Email not confirmed') ||
      errorCode === 'invalid_credentials') {
    return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
  }

  if (errorMessage.includes('Email rate limit exceeded')) {
    return 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
  }

  if (errorMessage.includes('User not found') || 
      errorMessage.includes('No user found')) {
    return 'Usuário não encontrado. Verifique o email informado ou cadastre-se.';
  }

  // Erros de permissão/RLS
  if (errorMessage.includes('permission denied') ||
      errorMessage.includes('insufficient_privilege') ||
      errorMessage.includes('row-level security') ||
      errorCode === 'PGRST301') {
    return 'Você não tem permissão para realizar esta ação. Entre em contato com o administrador do sistema.';
  }

  // Erros de constraint específicos
  if (errorMessage.includes('assets_iccid_key') || 
      errorMessage.includes('duplicate key value violates unique constraint "assets_iccid_key"')) {
    return 'Não foi possível salvar os dados. Já existe um ativo cadastrado com este ICCID.';
  }

  if (errorMessage.includes('assets_radio_key') || 
      errorMessage.includes('duplicate key value violates unique constraint "assets_radio_key"')) {
    return 'Não foi possível salvar os dados. Já existe um equipamento cadastrado com este número de rádio.';
  }

  if (errorMessage.includes('clients_cnpj_key') || 
      errorMessage.includes('duplicate key value violates unique constraint "clients_cnpj_key"')) {
    return 'Não foi possível cadastrar o cliente. Já existe um cliente com este CNPJ.';
  }

  if (errorMessage.includes('clients_email_key') || 
      errorMessage.includes('duplicate key value violates unique constraint "clients_email_key"')) {
    return 'Não foi possível cadastrar o cliente. Já existe um cliente com este email.';
  }

  // Erros de foreign key
  if (errorMessage.includes('foreign key constraint') ||
      errorMessage.includes('violates foreign key constraint')) {
    if (context?.entity === 'asset') {
      return 'Não foi possível excluir este ativo pois ele está vinculado a associações ou histórico.';
    }
    if (context?.entity === 'client') {
      return 'Não foi possível excluir este cliente pois ele possui ativos associados.';
    }
    return 'Não foi possível realizar a operação. Este item está vinculado a outros registros.';
  }

  // Erros de not null
  if (errorMessage.includes('null value in column') ||
      errorMessage.includes('violates not-null constraint')) {
    return 'Há campos obrigatórios não preenchidos. Por favor, revise os dados e tente novamente.';
  }

  // Erros de conexão
  if (errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout')) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.';
  }

  // Erros de validação
  if (errorMessage.includes('invalid input') ||
      errorMessage.includes('invalid format') ||
      errorMessage.includes('validation')) {
    if (context?.field) {
      return `O campo "${context.field}" possui um formato inválido. Por favor, verifique e tente novamente.`;
    }
    return 'Há dados inválidos no formulário. Por favor, revise as informações e tente novamente.';
  }

  // Erros específicos de associação
  if (errorMessage.includes('Asset should be available') ||
      errorMessage.includes('already associated')) {
    return 'Este ativo já está associado a outro cliente. Libere-o primeiro ou selecione outro ativo.';
  }

  // Erros de dados não encontrados
  if (errorMessage.includes('not found') ||
      errorMessage.includes('No data') ||
      errorMessage.includes('404')) {
    return 'Nenhum registro encontrado para os critérios informados.';
  }

  // Erro genérico baseado no contexto
  if (context?.action) {
    switch (context.action) {
      case 'create':
        return `Não foi possível criar ${context.entity || 'o registro'}. Tente novamente mais tarde.`;
      case 'update':
        return `Não foi possível atualizar ${context.entity || 'o registro'}. Tente novamente mais tarde.`;
      case 'delete':
        return `Não foi possível excluir ${context.entity || 'o registro'}. Tente novamente mais tarde.`;
      case 'fetch':
        return `Não foi possível carregar ${context.entity || 'os dados'}. Tente novamente mais tarde.`;
      default:
        return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
    }
  }

  // Fallback final
  return 'Ocorreu um erro inesperado ao processar sua solicitação. Tente novamente ou contate o suporte.';
};

// Funções de conveniência para contextos específicos
export const translateAssetError = (error: any, action: string) => 
  translateError(error, { action, entity: 'o ativo' });

export const translateClientError = (error: any, action: string) => 
  translateError(error, { action, entity: 'o cliente' });

export const translateAssociationError = (error: any, action: string) => 
  translateError(error, { action, entity: 'a associação' });

export const translateAuthError = (error: any) => 
  translateError(error, { action: 'authenticate', entity: 'usuário' });
