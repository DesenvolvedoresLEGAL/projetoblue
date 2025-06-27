
import { PostgrestError } from "@supabase/supabase-js";

// Tipos de erro para categorização
export enum ErrorCategory {
  CONSTRAINT = 'constraint',
  RLS = 'rls',
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown'
}

// Interface para erros traduzidos
export interface TranslatedError {
  message: string;
  category: ErrorCategory;
  originalError?: unknown;
}

// Função principal para traduzir erros
export function translateError(error: unknown, context?: string): TranslatedError {
  // Se já é uma string simples, usar como está
  if (typeof error === 'string') {
    return {
      message: error,
      category: ErrorCategory.UNKNOWN
    };
  }

  // Extrair mensagem do erro
  const errorMessage = error?.message || error?.error_description || String(error);
  const errorCode = error?.code || error?.status;
  const errorDetails = error?.details || '';

  // Detectar categoria do erro
  const category = detectErrorCategory(error, errorMessage, errorCode);

  // Traduzir baseado na categoria
  let translatedMessage: string;

  switch (category) {
    case ErrorCategory.CONSTRAINT:
      translatedMessage = translateConstraintError(error, errorMessage, context);
      break;
    case ErrorCategory.RLS:
      translatedMessage = translateRLSError(errorMessage, context);
      break;
    case ErrorCategory.NETWORK:
      translatedMessage = translateNetworkError(errorMessage, errorCode);
      break;
    case ErrorCategory.VALIDATION:
      translatedMessage = translateValidationError(errorMessage, context);
      break;
    case ErrorCategory.AUTHENTICATION:
      translatedMessage = translateAuthError(errorMessage, context);
      break;
    case ErrorCategory.NOT_FOUND:
      translatedMessage = translateNotFoundError(errorMessage, context);
      break;
    default:
      translatedMessage = translateGenericError(errorMessage, context);
  }

  return {
    message: translatedMessage,
    category,
    originalError: error
  };
}

// Detectar categoria do erro
function detectErrorCategory(error: unknown, message: string, code?: string): ErrorCategory {
  const lowerMessage = message.toLowerCase();

  // Erros de constraint/banco
  if (code === '23505' || lowerMessage.includes('duplicate key') || 
      lowerMessage.includes('already exists') || lowerMessage.includes('violates unique constraint')) {
    return ErrorCategory.CONSTRAINT;
  }

  if (code === '23503' || lowerMessage.includes('foreign key') || 
      lowerMessage.includes('violates foreign key constraint')) {
    return ErrorCategory.CONSTRAINT;
  }

  if (code === '23502' || lowerMessage.includes('null value') || 
      lowerMessage.includes('not-null constraint')) {
    return ErrorCategory.CONSTRAINT;
  }

  // Erros de RLS/Permissão
  if (code === '42501' || lowerMessage.includes('permission denied') || 
      lowerMessage.includes('row-level security') || lowerMessage.includes('policy')) {
    return ErrorCategory.RLS;
  }

  // Erros de autenticação
  if (lowerMessage.includes('invalid login') || lowerMessage.includes('invalid credentials') ||
      lowerMessage.includes('jwt') || lowerMessage.includes('unauthorized') ||
      lowerMessage.includes('authentication') || lowerMessage.includes('session')) {
    return ErrorCategory.AUTHENTICATION;
  }

  // Erros de rede/conexão
  if (lowerMessage.includes('network') || lowerMessage.includes('timeout') || 
      lowerMessage.includes('connection') || lowerMessage.includes('fetch') ||
      code === 'NETWORK_ERROR' || code === 'TIMEOUT') {
    return ErrorCategory.NETWORK;
  }

  // Dados não encontrados
  if (lowerMessage.includes('not found') || lowerMessage.includes('no rows') ||
      code === '404' || code === 'PGRST116') {
    return ErrorCategory.NOT_FOUND;
  }

  // Erros de validação
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid format') ||
      lowerMessage.includes('required') || lowerMessage.includes('must be')) {
    return ErrorCategory.VALIDATION;
  }

  return ErrorCategory.UNKNOWN;
}

// Traduzir erros de constraint específicos
function translateConstraintError(error: unknown, message: string, context?: string): string {
  const constraint = error?.constraint || '';
  const lowerMessage = message.toLowerCase();

  // ICCID duplicado
  if (constraint.includes('iccid') || lowerMessage.includes('iccid')) {
    return "Já existe um CHIP cadastrado com este ICCID. Verifique o número informado ou use outro CHIP.";
  }

  // CNPJ duplicado  
  if (constraint.includes('cnpj') || lowerMessage.includes('cnpj')) {
    return "Este CNPJ já está cadastrado no sistema. Verifique os dados ou faça login na conta existente.";
  }

  // Email duplicado
  if (constraint.includes('email') || lowerMessage.includes('email')) {
    return "Este email já está em uso. Tente fazer login ou use outro endereço de email.";
  }

  // Constraint de foreign key
  if (lowerMessage.includes('foreign key') || constraint.includes('fkey')) {
    if (context === 'delete') {
      return "Não foi possível excluir este item pois ele está vinculado a outros registros. Remova as associações primeiro.";
    }
    return "Os dados informados fazem referência a um registro que não existe. Verifique as informações e tente novamente.";
  }

  // Constraint de not null
  if (lowerMessage.includes('null') || lowerMessage.includes('required')) {
    return "Há campos obrigatórios que não foram preenchidos. Complete todos os dados necessários e tente novamente.";
  }

  // Duplicata genérica
  if (lowerMessage.includes('duplicate') || lowerMessage.includes('already exists')) {
    return "Já existe um registro com estes dados. Verifique as informações ou edite o registro existente.";
  }

  return "Não foi possível salvar os dados devido a uma restrição do sistema. Verifique as informações e tente novamente.";
}

// Traduzir erros de RLS/Permissão
function translateRLSError(message: string, context?: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('row-level security') || lowerMessage.includes('policy')) {
    return "Você não tem permissão para acessar estes dados. Entre em contato com o administrador do sistema.";
  }

  if (lowerMessage.includes('permission denied')) {
    if (context === 'create') {
      return "Você não tem permissão para criar este tipo de registro. Verifique suas permissões com o administrador.";
    }
    if (context === 'update') {
      return "Você não tem permissão para editar este registro. Verifique suas permissões com o administrador.";
    }
    if (context === 'delete') {
      return "Você não tem permissão para excluir este registro. Verifique suas permissões com o administrador.";
    }
    return "Você não tem permissão para realizar esta ação. Entre em contato com o administrador do sistema.";
  }

  return "Acesso negado. Verifique suas permissões ou entre em contato com o administrador.";
}

// Traduzir erros de rede/conexão
function translateNetworkError(message: string, code?: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('timeout') || code === 'TIMEOUT') {
    return "A operação demorou mais que o esperado. Verifique sua conexão com a internet e tente novamente.";
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('connection') || 
      lowerMessage.includes('fetch') || code === 'NETWORK_ERROR') {
    return "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.";
  }

  if (lowerMessage.includes('cors')) {
    return "Erro de configuração do servidor. Entre em contato com o suporte técnico.";
  }

  return "Problema de conexão com o servidor. Verifique sua internet e tente novamente em alguns instantes.";
}

// Traduzir erros de validação
function translateValidationError(message: string, context?: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('required') || lowerMessage.includes('obrigatório')) {
    return "Por favor, preencha todos os campos obrigatórios para continuar.";
  }

  if (lowerMessage.includes('email') && lowerMessage.includes('invalid')) {
    return "O formato do email informado é inválido. Verifique o endereço e tente novamente.";
  }

  if (lowerMessage.includes('phone') || lowerMessage.includes('telefone')) {
    return "O formato do telefone informado é inválido. Use apenas números com DDD.";
  }

  if (lowerMessage.includes('cnpj') && lowerMessage.includes('invalid')) {
    return "O CNPJ informado é inválido. Verifique os números e tente novamente.";
  }

  if (lowerMessage.includes('password') || lowerMessage.includes('senha')) {
    return "A senha não atende aos critérios de segurança. Use pelo menos 8 caracteres com letras e números.";
  }

  return "Há campos com formato inválido. Por favor, revise os dados informados e tente novamente.";
}

// Traduzir erros de autenticação
function translateAuthError(message: string, context?: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid login') || lowerMessage.includes('invalid credentials')) {
    return "Email ou senha incorretos. Verifique suas credenciais e tente novamente.";
  }

  if (lowerMessage.includes('session') || lowerMessage.includes('jwt')) {
    return "Sua sessão expirou. Faça login novamente para continuar.";
  }

  if (lowerMessage.includes('email not confirmed')) {
    return "Confirme seu email antes de fazer login. Verifique sua caixa de entrada.";
  }

  if (lowerMessage.includes('too many requests')) {
    return "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.";
  }

  return "Falha na autenticação. Verifique suas credenciais ou tente novamente mais tarde.";
}

// Traduzir erros de dados não encontrados
function translateNotFoundError(message: string, context?: string): string {
  if (context === 'client') {
    return "Cliente não encontrado. Verifique se os dados estão corretos.";
  }

  if (context === 'asset') {
    return "Ativo não encontrado. Verifique se o código está correto.";
  }

  if (context === 'association') {
    return "Associação não encontrada. Ela pode ter sido removida ou não existe.";
  }

  return "Nenhum registro encontrado para os critérios informados.";
}

// Traduzir erros genéricos
function translateGenericError(message: string, context?: string): string {
  // Tentar detectar alguns padrões comuns mesmo em erros genéricos
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('server error') || lowerMessage.includes('internal error')) {
    return "Erro interno do servidor. Tente novamente em alguns instantes ou entre em contato com o suporte.";
  }

  if (lowerMessage.includes('bad request')) {
    return "Os dados enviados são inválidos. Verifique as informações e tente novamente.";
  }

  if (context === 'create') {
    return "Não foi possível criar o registro. Verifique os dados e tente novamente.";
  }

  if (context === 'update') {
    return "Não foi possível atualizar o registro. Verifique os dados e tente novamente.";
  }

  if (context === 'delete') {
    return "Não foi possível excluir o registro. Tente novamente ou entre em contato com o suporte.";
  }

  return "Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte se o problema persistir.";
}

// Função de conveniência para usar nos componentes
export function showFriendlyError(error: unknown, context?: string): string {
  const translated = translateError(error, context);
  
  // Log do erro original para debug
  console.error('[Error Translator]', {
    originalError: error,
    translatedMessage: translated.message,
    category: translated.category,
    context
  });

  return translated.message;
}
