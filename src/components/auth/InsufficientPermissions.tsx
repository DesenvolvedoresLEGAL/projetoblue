
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRoleLabel } from '@/utils/roleUtils';
import { UserRole } from '@/types/auth';

interface InsufficientPermissionsProps {
  requiredRole?: UserRole;
  message?: string;
  showBackButton?: boolean;
}

export const InsufficientPermissions = ({ 
  requiredRole, 
  message,
  showBackButton = true 
}: InsufficientPermissionsProps) => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const defaultMessage = requiredRole 
    ? `Esta página requer permissões de ${getRoleLabel(requiredRole)} ou superior. Seu role atual é ${getRoleLabel(userRole)}.`
    : 'Você não tem permissão para acessar esta página.';

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-amber-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Acesso Restrito</CardTitle>
          <CardDescription>
            Permissões insuficientes para esta funcionalidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200">
            <HelpCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              {message || defaultMessage}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Seu role atual:</strong> {getRoleLabel(userRole)}</p>
            {requiredRole && (
              <p><strong>Role necessário:</strong> {getRoleLabel(requiredRole)} ou superior</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {showBackButton && (
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <Button 
              variant="default"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Ir para Dashboard
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Entre em contato com um administrador para solicitar acesso
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
