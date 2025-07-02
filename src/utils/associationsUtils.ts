
// Utility functions for associations

export const sanitizeSearchTerm = (term: string): string => {
  if (!term) return '';
  return term.trim().replace(/[^\w\s-@.]/gi, '');
};

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

export const isActiveAssociation = (exitDate: string | null): boolean => {
  if (!exitDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return exitDate > today;
};
