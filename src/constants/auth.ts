
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

// Hierarquia de roles para controle de acesso
export const ROLE_HIERARCHY = {
  admin: 3,
  suporte: 2,
  cliente: 1,
  user: 0
} as const;

// Mapeamento de sinônimos para os roles
export const ROLE_SYNONYMS = {
  suport: 'suporte',
  support: 'suporte'
} as const;

// Labels amigáveis para os roles
export const ROLE_LABELS = {
  admin: 'Administrador',
  suporte: 'Suporte',
  cliente: 'Cliente',
  user: 'Usuário'
} as const;

// Descrições dos roles
export const ROLE_DESCRIPTIONS = {
  admin: 'Acesso total ao sistema, incluindo configurações avançadas',
  suporte: 'Suporte técnico e atendimento ao cliente',
  cliente: 'Acesso aos recursos básicos do sistema',
  user: 'Acesso limitado ao sistema'
} as const;

// Cores para badges de role
export const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  suporte: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  cliente: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  user: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
} as const;
