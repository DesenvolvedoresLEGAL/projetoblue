
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Gift, AlertCircle } from 'lucide-react';
import { Reward } from '../types';
import { useRewards, usePoints } from '../../hooks/useBits';

interface RewardsListProps {
  className?: string;
}

export const RewardsList: React.FC<RewardsListProps> = ({ 
  className = '' 
}) => {
  const { availableRewards, isLoadingRewards, redeemReward, isRedeeming } = useRewards();
  const { stats } = usePoints();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsDialogOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (selectedReward) {
      redeemReward(selectedReward.id, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedReward(null);
        }
      });
    }
  };

  if (isLoadingRewards) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recompensas disponíveis</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (availableRewards.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recompensas disponíveis</CardTitle>
          <CardDescription>
            Não há recompensas disponíveis no momento. Volte mais tarde!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recompensas disponíveis</CardTitle>
          <CardDescription>
            Troque seus pontos por estas recompensas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRewards.map((reward) => {
              const canRedeem = stats?.current_points_balance && stats.current_points_balance >= reward.points_required;
              
              return (
                <Card key={reward.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      <span>{reward.name}</span>
                    </CardTitle>
                    <CardDescription>
                      {reward.description || 'Sem descrição disponível'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">{reward.points_required} pontos</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleRedeemClick(reward)}
                      disabled={!canRedeem}
                      variant={canRedeem ? 'default' : 'outline'}
                    >
                      {canRedeem ? 'Resgatar' : 'Pontos insuficientes'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar resgate</DialogTitle>
            <DialogDescription>
              Você está prestes a resgatar a seguinte recompensa:
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="py-4">
              <h3 className="text-lg font-medium">{selectedReward.name}</h3>
              <p className="text-muted-foreground mt-1">{selectedReward.description}</p>
              <div className="flex items-center gap-2 mt-4">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="text-sm">
                  Esta ação gastará <strong>{selectedReward.points_required} pontos</strong> do seu saldo.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleConfirmRedeem}
              disabled={isRedeeming}
            >
              {isRedeeming ? 'Processando...' : 'Confirmar resgate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
