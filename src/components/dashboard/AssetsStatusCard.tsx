
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assetService, AssetStatusByType } from "@/services/api/assetService";
import { Badge } from "@/components/ui/badge";

export const AssetsStatusCard: React.FC = () => {
  const { data: statusData = [], isLoading } = useQuery({
    queryKey: ['status-by-type'],
    queryFn: assetService.statusByType
  });

  // Group status data by type
  const groupedByType = React.useMemo(() => {
    const grouped: Record<string, AssetStatusByType[]> = {};
    
    statusData.forEach((item) => {
      if (!grouped[item.type]) {
        grouped[item.type] = [];
      }
      grouped[item.type].push(item);
    });
    
    return grouped;
  }, [statusData]);

  // Get badge color based on status
  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'disponível') return 'bg-green-500';
    if (statusLower === 'alugado') return 'bg-blue-500';
    if (statusLower === 'assinatura') return 'bg-purple-500';
    if (statusLower === 'sem dados') return 'bg-gray-500';
    if (statusLower === 'bloqueado') return 'bg-red-500';
    if (statusLower === 'manutenção') return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos ativos</CardTitle>
        <CardDescription>Distribuição por tipo e status</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(groupedByType).map(([type, statuses]) => (
              <div key={type} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg capitalize mb-3">{type}</h3>
                <ul className="space-y-2">
                  {statuses.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)} variant="secondary">
                          {item.status}
                        </Badge>
                      </div>
                      <span className="font-semibold">{item.total}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetsStatusCard;
