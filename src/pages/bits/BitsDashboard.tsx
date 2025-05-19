
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PointsDisplay } from '@/features/bits/components/PointsDisplay';
import { LevelProgress } from '@/features/bits/components/LevelProgress';
import { ReferralLink } from '@/features/bits/components/ReferralLink';
import { ReferralsList } from '@/features/bits/components/ReferralsList';
import { UserBadgesList } from '@/features/bits/components/UserBadgesList';
import { usePoints, useReferrals, useBadges, useLevels } from '@/features/bits/hooks/useBits';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, Award, UserPlus } from 'lucide-react';

const BitsDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { stats, isLoadingStats } = usePoints();
  const { referrals, isLoadingReferrals } = useReferrals();
  const { userBadges, isLoadingUserBadges } = useBadges();
  const { currentLevel, nextLevel, isLoadingCurrentLevel, isLoadingNextLevel } = useLevels();

  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Acesso restrito</CardTitle>
          <CardDescription>Faça login para acessar a plataforma BITS LEGAL™</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to="/login">
            <Button>Fazer Login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">BITS LEGAL™ Dashboard</h1>
        <Link to="/bits/indicate">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Indicar agora
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PointsDisplay 
          points={stats?.current_points_balance || 0}
          label="Saldo de pontos"
          size="lg"
          className="lg:col-span-2"
        />
        
        <PointsDisplay 
          points={stats?.total_points_earned || 0}
          label="Total de pontos ganhos"
        />
      </div>
      
      <LevelProgress 
        stats={stats} 
        currentLevel={currentLevel} 
        nextLevel={nextLevel}
        className="max-w-full"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReferralLink />
        
        <Card>
          <CardHeader>
            <CardTitle>Resumo de atividades</CardTitle>
            <CardDescription>
              Suas atividades recentes e status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
                <span>Indicações feitas</span>
              </div>
              <span className="font-bold">{referrals?.length || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <span>Conquistas</span>
              </div>
              <span className="font-bold">{userBadges?.length || 0}</span>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Link to="/bits/my-referrals" className="text-primary">
                  Ver todas as indicações
                </Link>
                <ChevronRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ReferralsList 
          referrals={referrals?.slice(0, 5) || []}
          isLoading={isLoadingReferrals} 
        />
        
        <UserBadgesList 
          badges={userBadges || []} 
          isLoading={isLoadingUserBadges}
        />
        
        <div className="flex justify-center mt-6">
          <Link to="/bits/rewards">
            <Button>
              Ver todas as recompensas disponíveis
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BitsDashboard;
