import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { PointTransaction } from '@modules/bits/types';

interface PointsHistoryProps {
  transactions: PointTransaction[];
  isLoading: boolean;
  className?: string;
}

export const PointsHistory: React.FC<PointsHistoryProps> = ({ 
  transactions, 
  isLoading,
  className = '' 
}) => {
  const getActionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'referral_created': 'Indicação criada',
      'referral_approved': 'Indicação aprovada',
      'referral_converted': 'Indicação convertida',
      'reward_redemption': 'Resgate de recompensa',
      'mission_completed': 'Missão completa',
      'admin_adjustment': 'Ajuste administrativo',
      'signup_bonus': 'Bônus de cadastro'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Histórico de pontos</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Histórico de pontos</CardTitle>
          <CardDescription>
            Você ainda não tem histórico de pontos. Comece indicando amigos!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Histórico de pontos</CardTitle>
        <CardDescription>
          Acompanhe como você ganhou e gastou seus pontos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Histórico de transações de pontos</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{getActionTypeLabel(transaction.action_type)}</TableCell>
                  <TableCell>{transaction.description || '-'}</TableCell>
                  <TableCell className={`text-right font-medium ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.points > 0 ? `+${transaction.points}` : transaction.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
