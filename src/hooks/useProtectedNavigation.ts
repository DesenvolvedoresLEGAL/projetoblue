
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { translateAuthError } from '@/utils/errorTranslator';
import { toast } from '@/utils/toast';

export const useProtectedNavigation = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const navigateToProtectedRoute = (route: string) => {
    try {
      if (isLoading) {
        return;
      }

      if (!isAuthenticated) {
        toast.error('Você precisa estar logado para acessar esta página. Faça login e tente novamente.');
        navigate('/login');
        return;
      }

      navigate(route);
    } catch (error) {
      console.error('Erro na navegação protegida:', error);
      toast.error(translateAuthError(error));
    }
  };

  return {
    navigateToProtectedRoute,
    isAuthenticated,
    isLoading
  };
};
