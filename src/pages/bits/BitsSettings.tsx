
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ReferralLink } from '@/features/bits/components/ReferralLink';
import { useBitsProfile } from '@/features/bits/hooks/useBits';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const BitsSettings: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { profile, isLoading } = useBitsProfile();
  
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
      <h1 className="text-2xl font-semibold">Configurações BITS™</h1>
      <p className="text-muted-foreground">
        Gerencie suas preferências e configurações do programa de indicação BITS LEGAL™.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Informações do seu perfil no programa BITS LEGAL™
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={profile?.email || ''} 
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Input 
                  id="role" 
                  value={profile?.role || 'user'} 
                  disabled
                />
              </div>
              
              {profile?.is_active !== undefined && (
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="is-active" className="flex-1">Conta ativa</Label>
                  <Switch
                    id="is-active"
                    checked={profile.is_active}
                    disabled
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <ReferralLink />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notif" className="flex-1">
                  Notificações por email
                </Label>
                <Switch id="email-notif" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="new-reward-notif" className="flex-1">
                  Novas recompensas
                </Label>
                <Switch id="new-reward-notif" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="referral-status-notif" className="flex-1">
                  Alterações de status das indicações
                </Label>
                <Switch id="referral-status-notif" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="points-notif" className="flex-1">
                  Ganho de pontos
                </Label>
                <Switch id="points-notif" defaultChecked />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacidade</CardTitle>
              <CardDescription>
                Gerencie suas configurações de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-in-ranking" className="flex-1">
                  Aparecer no ranking público
                </Label>
                <Switch id="show-in-ranking" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="share-stats" className="flex-1">
                  Compartilhar estatísticas
                </Label>
                <Switch id="share-stats" defaultChecked />
              </div>
              
              <div className="pt-4 mt-4 border-t">
                <Button variant="outline">
                  Ver termos e política de privacidade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-center pt-6">
        <Button className="w-full max-w-md">Salvar configurações</Button>
      </div>
    </div>
  );
};

export default BitsSettings;
