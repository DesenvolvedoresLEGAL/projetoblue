
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserBadge } from '../types';
import { format } from 'date-fns';

interface UserBadgesListProps {
  badges: UserBadge[];
  isLoading: boolean;
  className?: string;
}

export const UserBadgesList: React.FC<UserBadgesListProps> = ({
  badges,
  isLoading,
  className = ''
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Minhas conquistas</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Minhas conquistas</CardTitle>
          <CardDescription>
            Você ainda não ganhou nenhuma conquista. Continue participando do programa para desbloquear badges!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Minhas conquistas</CardTitle>
        <CardDescription>
          Veja as badges que você conquistou no programa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center p-3 border rounded-lg">
              {badge.bits_badges_catalog.icon_url ? (
                <img 
                  src={badge.bits_badges_catalog.icon_url} 
                  alt={badge.bits_badges_catalog.name}
                  className="w-16 h-16 mb-2" 
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold">🏆</span>
                </div>
              )}
              <h3 className="text-sm font-medium text-center">{badge.bits_badges_catalog.name}</h3>
              <span className="text-xs text-gray-500 mt-1">
                {format(new Date(badge.earned_at), 'dd/MM/yyyy')}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
