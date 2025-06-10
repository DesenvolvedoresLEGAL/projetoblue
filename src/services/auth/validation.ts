
import { checkPasswordStrength } from '@/utils/passwordStrength';
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE, AuthErrorCategory } from '@/constants/auth';

interface SignUpData {
  email: string;
  password: string;
  role?: UserRole;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  category?: AuthErrorCategory;
}

export const validateSignUpData = ({ email, password }: SignUpData): ValidationResult => {
  if (!email || !email.includes('@') || !email.includes('.')) {
    return {
      isValid: false,
      error: 'Email inválido. Por favor, forneça um email válido.',
      category: AuthErrorCategory.INVALID_EMAIL
    };
  }
  
  if (!password || password.length < 6) {
    return {
      isValid: false,
      error: 'Senha muito curta. Deve ter pelo menos 6 caracteres.',
      category: AuthErrorCategory.INVALID_PASSWORD
    };
  }
  
  const passwordStrength = checkPasswordStrength(password);
  if (passwordStrength === 'weak') {
    return {
      isValid: false,
      error: 'Senha fraca. Use uma combinação de letras, números e caracteres especiais.',
      category: AuthErrorCategory.INVALID_PASSWORD
    };
  }
  
  return { isValid: true };
};

export const validateRole = (role: UserRole): UserRole => {
  if (!['admin', 'gestor', 'consultor', 'suporte', 'cliente', 'user'].includes(role)) {
    console.warn(`Valor de role inválido: ${role}, usando '${DEFAULT_USER_ROLE}' como padrão`);
    return DEFAULT_USER_ROLE as UserRole;
  }
  return role;
};
