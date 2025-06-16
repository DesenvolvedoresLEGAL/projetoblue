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
  // LOGS TEMPORÁRIOS DE DEBUG - REMOVER DEPOIS
  console.log('🔍 [DEBUG] isValidRole - Input role:', role);
  console.log('🔍 [DEBUG] isValidRole - ROLE_HIERARCHY keys:', Object.keys(ROLE_HIERARCHY));
  console.log('🔍 [DEBUG] isValidRole - ROLE_SYNONYMS keys:', Object.keys(ROLE_SYNONYMS));
  
  const inHierarchy = Object.prototype.hasOwnProperty.call(ROLE_HIERARCHY, role);
  const inSynonyms = Object.prototype.hasOwnProperty.call(ROLE_SYNONYMS, role);
  
  console.log('🔍 [DEBUG] isValidRole - Role in ROLE_HIERARCHY:', inHierarchy);
  console.log('🔍 [DEBUG] isValidRole - Role in ROLE_SYNONYMS:', inSynonyms);
  console.log('🔍 [DEBUG] isValidRole - Final result:', inHierarchy || inSynonyms);
  
  return inHierarchy || inSynonyms;
};

/**
 * Converte string para UserRole com validação
 */
export const toUserRole = (role: string): UserRole => {
  // LOGS TEMPORÁRIOS DE DEBUG - REMOVER DEPOIS
  console.log('🎯 [DEBUG] toUserRole - Starting with input role:', role);
  console.log('🎯 [DEBUG] toUserRole - Type of input role:', typeof role);
  console.log('🎯 [DEBUG] toUserRole - ROLE_HIERARCHY object:', ROLE_HIERARCHY);
  console.log('🎯 [DEBUG] toUserRole - ROLE_SYNONYMS object:', ROLE_SYNONYMS);
  
  // Primeira verificação: role está diretamente em ROLE_HIERARCHY
  const roleInHierarchy = Object.prototype.hasOwnProperty.call(ROLE_HIERARCHY, role);
  console.log('🎯 [DEBUG] toUserRole - Role in ROLE_HIERARCHY check:', roleInHierarchy);
  
  if (roleInHierarchy) {
    console.log('🎯 [DEBUG] toUserRole - Returning role from ROLE_HIERARCHY:', role);
    return role as UserRole;
  }
  
  // Segunda verificação: role está em ROLE_SYNONYMS
  const roleInSynonyms = Object.prototype.hasOwnProperty.call(ROLE_SYNONYMS, role);
  console.log('🎯 [DEBUG] toUserRole - Role in ROLE_SYNONYMS check:', roleInSynonyms);
  
  if (roleInSynonyms) {
    const mappedRole = ROLE_SYNONYMS[role as keyof typeof ROLE_SYNONYMS];
    console.log('🎯 [DEBUG] toUserRole - Returning mapped role from ROLE_SYNONYMS:', mappedRole);
    return mappedRole;
  }
  
  // Fallback final
  console.log('🎯 [DEBUG] toUserRole - No match found, falling back to cliente');
  console.log('🎯 [DEBUG] toUserRole - This should NOT happen for role "suporte"');
  return 'cliente'; // fallback seguro
};
