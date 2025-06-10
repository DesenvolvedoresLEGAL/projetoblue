
import { UserRole } from '@/types/auth';
import { ROLE_HIERARCHY, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS, DEFAULT_USER_ROLE } from '@/constants/auth';

/**
 * Verifica se um role tem permissão mínima necessária
 */
export const hasMinimumRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  try {
    // Safety checks
    if (!userRole || !requiredRole) {
      console.warn('hasMinimumRole: Invalid roles provided', { userRole, requiredRole });
      return false;
    }

    // Check if roles exist in hierarchy
    if (!(userRole in ROLE_HIERARCHY) || !(requiredRole in ROLE_HIERARCHY)) {
      console.warn('hasMinimumRole: Role not found in hierarchy', { userRole, requiredRole });
      return false;
    }

    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
    
    return userLevel >= requiredLevel;
  } catch (error) {
    console.error('Error in hasMinimumRole:', error);
    return false;
  }
};

/**
 * Verifica se o usuário é suporte ou superior
 */
export const isSupportOrAbove = (userRole: UserRole): boolean => {
  try {
    return hasMinimumRole(userRole, 'suporte');
  } catch (error) {
    console.error('Error in isSupportOrAbove:', error);
    return false;
  }
};

/**
 * Verifica se o usuário é cliente ou superior
 */
export const isClienteOrAbove = (userRole: UserRole): boolean => {
  try {
    return hasMinimumRole(userRole, 'cliente');
  } catch (error) {
    console.error('Error in isClienteOrAbove:', error);
    return false;
  }
};

/**
 * Verifica se o usuário é admin
 */
export const isAdmin = (userRole: UserRole): boolean => {
  try {
    return userRole === 'admin';
  } catch (error) {
    console.error('Error in isAdmin:', error);
    return false;
  }
};

/**
 * Obtém o label amigável do role
 */
export const getRoleLabel = (role: UserRole): string => {
  try {
    return ROLE_LABELS[role] || role;
  } catch (error) {
    console.error('Error in getRoleLabel:', error);
    return role || 'unknown';
  }
};

/**
 * Obtém a descrição do role
 */
export const getRoleDescription = (role: UserRole): string => {
  try {
    return ROLE_DESCRIPTIONS[role] || 'Role não identificado';
  } catch (error) {
    console.error('Error in getRoleDescription:', error);
    return 'Role não identificado';
  }
};

/**
 * Obtém as classes CSS para o badge do role
 */
export const getRoleColors = (role: UserRole): string => {
  try {
    return ROLE_COLORS[role] || ROLE_COLORS.user || '';
  } catch (error) {
    console.error('Error in getRoleColors:', error);
    return '';
  }
};

/**
 * Obtém todos os roles disponíveis ordenados por hierarquia
 */
export const getAllRoles = (): UserRole[] => {
  try {
    return Object.keys(ROLE_HIERARCHY).sort(
      (a, b) => ROLE_HIERARCHY[b as UserRole] - ROLE_HIERARCHY[a as UserRole]
    ) as UserRole[];
  } catch (error) {
    console.error('Error in getAllRoles:', error);
    return ['cliente'] as UserRole[];
  }
};

/**
 * Obtém roles que podem ser atribuídos por um determinado role
 * (um usuário só pode atribuir roles de nível igual ou inferior)
 */
export const getAssignableRoles = (userRole: UserRole): UserRole[] => {
  try {
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    return getAllRoles().filter(role => ROLE_HIERARCHY[role] <= userLevel);
  } catch (error) {
    console.error('Error in getAssignableRoles:', error);
    return ['cliente'] as UserRole[];
  }
};

/**
 * Verifica se um role é válido
 */
export const isValidRole = (role: string): role is UserRole => {
  try {
    return role in ROLE_HIERARCHY;
  } catch (error) {
    console.error('Error in isValidRole:', error);
    return false;
  }
};

/**
 * Converte string para UserRole com validação
 */
export const toUserRole = (role: string): UserRole => {
  try {
    if (isValidRole(role)) {
      return role;
    }
    return DEFAULT_USER_ROLE; // fallback seguro
  } catch (error) {
    console.error('Error in toUserRole:', error);
    return DEFAULT_USER_ROLE; // fallback seguro
  }
};
