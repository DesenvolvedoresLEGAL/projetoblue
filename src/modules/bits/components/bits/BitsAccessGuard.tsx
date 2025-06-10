
import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { getRoleLabel } from '@/utils/roleUtils';

interface BitsAccessGuardProps {
  children: ReactNode;
}

export const BitsAccessGuard = ({ children }: BitsAccessGuardProps) => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  return (
    <RoleGuard 
      requiredRole="cliente"
      fallback={
        <div className="flex h-screen w-full items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full w-fit">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">BITS™ Programa de Indicações</CardTitle>
              <CardDescription>
                Sistema exclusivo de recompensas e benefícios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  O programa BITS™ é exclusivo para clientes ativos da nossa plataforma.
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">
                      Acesso Restrito
                    </span>
                  </div>
                  <p className="text-sm text-amber-700">
                    <strong>Seu role atual:</strong> {getRoleLabel(userRole)}
                  </p>
                  <p className="text-sm text-amber-700">
                    <strong>Role necessário:</strong> Cliente ou superior
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <h4 className="font-semibold text-sm">Benefícios do BITS™:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-green-600" />
                      Ganhe pontos por indicações
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-green-600" />
                      Troque pontos por recompensas
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-green-600" />
                      Acesso a níveis exclusivos
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-green-600" />
                      Missões especiais
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="w-full"
                >
                  Voltar
                </Button>
                <Button 
                  variant="default"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Ir para Dashboard
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Entre em contato para mais informações sobre como se tornar um cliente
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      {children}
    </RoleGuard>
  );
};
