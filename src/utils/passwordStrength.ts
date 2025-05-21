
export const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | null => {
  if (!password) return null;
  
  // Check password length
  const isLongEnough = password.length >= 8;
  
  // Check for uppercase, lowercase, numbers, and special characters
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  // Count the different character types
  const charTypesCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars]
    .filter(Boolean).length;
  
  if (isLongEnough && charTypesCount >= 3) {
    return 'strong';
  } else if (isLongEnough && charTypesCount >= 2) {
    return 'medium';
  } else {
    return 'weak';
  }
};
