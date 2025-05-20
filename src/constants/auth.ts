
// Valores padrão para autenticação
export const DEFAULT_USER_ROLE = 'cliente';

// Categorias de erros para melhor tratamento
export enum AuthErrorCategory {
  DUPLICATE_EMAIL = 'duplicate_email',
  INVALID_PASSWORD = 'invalid_password',
  INVALID_EMAIL = 'invalid_email',
  PROFILE_CREATION = 'profile_creation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

// Mensagens de erro amigáveis
export const AUTH_ERROR_MESSAGES = {
  [AuthErrorCategory.DUPLICATE_EMAIL]: 'Este email já está cadastrado.',
  [AuthErrorCategory.INVALID_PASSWORD]: 'A senha não atende aos requisitos mínimos.',
  [AuthErrorCategory.INVALID_EMAIL]: 'O email fornecido é inválido.',
  [AuthErrorCategory.PROFILE_CREATION]: 'Erro ao criar seu perfil. Por favor, tente novamente ou contate o suporte.',
  [AuthErrorCategory.NETWORK]: 'Falha na conexão com o servidor. Verifique sua internet e tente novamente.',
  [AuthErrorCategory.AUTHENTICATION]: 'Falha na autenticação. Verifique suas credenciais.',
  [AuthErrorCategory.UNKNOWN]: 'Ocorreu um erro inesperado. Por favor, tente novamente.'
};
