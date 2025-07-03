import { UserRole, UserProfile } from '@/types/auth';
import { getRoleLabel } from './roleUtils';
import { toast } from './toast';

export const ROLE_TOAST_MESSAGES: Record<UserRole, { loginSuccess: string; logoutSuccess: string }> = {
  admin: {
    loginSuccess: 'Bem-vindo(a), {user}! Você está logado como {role}.',
    logoutSuccess: '{role} desconectado com sucesso.'
  },
  suporte: {
    loginSuccess: 'Bem-vindo(a), {user}! Acesso de {role} autorizado.',
    logoutSuccess: '{role} desconectado com sucesso.'
  },
  cliente: {
    loginSuccess: 'Bem-vindo(a), {user}! Você está logado como {role}.',
    logoutSuccess: 'Sessão de {role} encerrada.'
  },
  user: {
    loginSuccess: 'Bem-vindo(a), {user}! Você está logado como {role}.',
    logoutSuccess: 'Sessão de {role} encerrada.'
  }
};

function format(template: string, role: UserRole, username?: string): string {
  return template
    .replace('{role}', getRoleLabel(role))
    .replace('{user}', username ?? '');
}

export function getLoginSuccessMessage(role: UserRole, username: string): string {
  return format(ROLE_TOAST_MESSAGES[role].loginSuccess, role, username);
}

export function getLogoutSuccessMessage(role: UserRole): string {
  return format(ROLE_TOAST_MESSAGES[role].logoutSuccess, role);
}

export function toastLoginSuccess(profile: UserProfile) {
  toast.success(getLoginSuccessMessage(profile.role, profile.username));
}

export function toastLogoutSuccess(role: UserRole) {
  toast.success(getLogoutSuccessMessage(role));
}

