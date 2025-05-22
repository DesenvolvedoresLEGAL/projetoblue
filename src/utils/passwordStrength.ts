
export const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  if (isLongEnough && hasLetter && hasNumber && hasSpecial) {
    return 'strong';
  } else if (isLongEnough && ((hasLetter && hasNumber) || (hasLetter && hasSpecial) || (hasNumber && hasSpecial))) {
    return 'medium';
  }
  return 'weak';
};
