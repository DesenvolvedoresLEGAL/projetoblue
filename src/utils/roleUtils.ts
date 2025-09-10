
import { UserRole } from '@/types/auth';
import {
  ROLE_HIERARCHY,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  ROLE_SYNONYMS
} from '@/constants/auth';

/**
 * Verifica se um role tem permissão mínima necessária
 */
export const hasMinimumRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
};

/**
 * Verifica se o usuário é suporte ou superior
 */
export const isSupportOrAbove = (userRole: UserRole): boolean => {
  return hasMinimumRole(userRole, 'suporte');
};

/**
 * Verifica se o usuário é cliente ou superior
 */
export const isClienteOrAbove = (userRole: UserRole): boolean => {
  return hasMinimumRole(userRole, 'cliente');
};

/**
 * Verifica se o usuário é admin
 */
export const isAdmin = (userRole: UserRole): boolean => {
  return userRole === 'admin';
};

/**
 * Obtém o label amigável do role
 */
export const getRoleLabel = (role: UserRole): string => {
  return ROLE_LABELS[role] || role;
};

/**
 * Obtém a descrição do role
 */
export const getRoleDescription = (role: UserRole): string => {
  return ROLE_DESCRIPTIONS[role] || 'Role não identificado';
};

/**
 * Obtém as classes CSS para o badge do role
 */
export const getRoleColors = (role: UserRole): string => {
  return ROLE_COLORS[role] || ROLE_COLORS.user;
};

/**
 * Obtém todos os roles disponíveis ordenados por hierarquia
 */
export const getAllRoles = (): UserRole[] => {
  return Object.keys(ROLE_HIERARCHY).sort(
    (a, b) => ROLE_HIERARCHY[b as UserRole] - ROLE_HIERARCHY[a as UserRole]
  ) as UserRole[];
};

/**
 * Obtém roles que podem ser atribuídos por um determinado role
 * (um usuário só pode atribuir roles de nível igual ou inferior)
 */
export const getAssignableRoles = (userRole: UserRole): UserRole[] => {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  return getAllRoles().filter(role => ROLE_HIERARCHY[role] <= userLevel);
};

/**
 * Verifica se um role é válido
 */
export const isValidRole = (role: string): role is UserRole => {
  // Verificação direta usando 'in' operator que é mais confiável
  const inHierarchy = role in ROLE_HIERARCHY;
  const inSynonyms = role in ROLE_SYNONYMS;

  return inHierarchy || inSynonyms;
};

/**
 * Converte string para UserRole com validação
 */
export const toUserRole = (role: string): UserRole => {
  if (!role) {
    return 'cliente';
  }

  // Primeira verificação: role está diretamente em ROLE_HIERARCHY
  if (Object.prototype.hasOwnProperty.call(ROLE_HIERARCHY, role)) {
    return role as UserRole;
  }

  // Segunda verificação: role está em ROLE_SYNONYMS
  if (Object.prototype.hasOwnProperty.call(ROLE_SYNONYMS, role)) {
    const mappedRole = ROLE_SYNONYMS[role as keyof typeof ROLE_SYNONYMS];
    return mappedRole;
  }

  // Log para debug quando role não é reconhecido
  console.warn(`🔧 toUserRole: Role '${role}' não reconhecido, usando fallback 'cliente'`);

  // Fallback final
  return 'cliente';
};
