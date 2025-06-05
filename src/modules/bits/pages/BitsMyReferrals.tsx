
import React from 'react';
import { ReferralsList } from '@modules/bits/components/ReferralsList';
import { ReferralLink } from '@modules/bits/components/ReferralLink';
import { useReferrals } from '@modules/bits/hooks/useBits';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const BitsMyReferrals: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { referrals, isLoadingReferrals, refetchReferrals } = useReferrals();
  
  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Acesso restrito</CardTitle>
          <CardContent>Faça login para acessar a plataforma BITS LEGAL™</CardContent>
        </CardHeader>
        <CardContent>
          <Link to="/login">
            <Button>Fazer Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Minhas Indicações</h1>
        <Link to="/bits/indicate">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Nova indicação
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReferralsList 
            referrals={referrals} 
            isLoading={isLoadingReferrals} 
          />
        </div>
        
        <div>
          <ReferralLink className="mb-6" />
          
          <Card>
            <CardHeader>
              <CardTitle>Status das indicações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Pendente</h3>
                <p className="text-xs text-muted-foreground">
                  A indicação foi registrada e está sendo processada.
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Aprovada</h3>
                <p className="text-xs text-muted-foreground">
                  A indicação foi validada e você ganhou os primeiros pontos.
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Convertida</h3>
                <p className="text-xs text-muted-foreground">
                  A pessoa indicada se tornou cliente e você ganhou pontos extras.
                </p>
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Rejeitada</h3>
                <p className="text-xs text-muted-foreground">
                  A indicação foi negada por não atender aos critérios.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BitsMyReferrals;
