
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';

interface StatusDetail {
  status: string;
  type: string;
  total: number;
}

interface DashboardStats {
  data?: {
    pieChartData: { status: string; total: number; color: string }[];
    detailedStatusData: StatusDetail[];
  };
}

interface RefactoredAssetStatusDistributionCardProps {
  dashboardStats: DashboardStats;
}

export const RefactoredAssetStatusDistributionCard: React.FC<RefactoredAssetStatusDistributionCardProps> = ({ 
  dashboardStats 
}) => {
  // Tooltip personalizada para mostrar detalhamento por tipo dentro de cada status
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const status = payload[0].payload.status;
      const total = payload[0].payload.total;
      
      // Busca todos os tipos que existem neste status
      const typeInfo = dashboardStats.data?.detailedStatusData
        ?.filter((item: StatusDetail) => item.status === status)
        ?.map((item: StatusDetail) => `${item.type}: ${item.total}`)
        ?.join(' | ') || 'Sem detalhes';
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <div className="font-semibold text-gray-900 mb-1">
            {status}: {total} ativos
          </div>
          <div className="text-sm text-gray-600">
            {typeInfo}
          </div>
        </div>
      );
    }
    return null;
  };

  // Prepare data for pie chart (memoized to prevent unnecessary recalculations)
  const statusChartData = useMemo(() => {
    if (!dashboardStats.data?.pieChartData || !Array.isArray(dashboardStats.data.pieChartData)) {
      return [];
    }
    
    return dashboardStats.data.pieChartData;
  }, [dashboardStats.data?.pieChartData]);

  // Colors for chart
  const COLORS = ['#4D2BFB', '#0ea5e9', '#f97316', '#ef4444', '#8b5cf6', '#84cc16'];
  const isMobile = useIsMobile();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex text-xl items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Ativos por Status
        </CardTitle>
        <CardDescription className='text-sm sm:text-xs'>
          { isMobile ? 
          "Distribuição dos ativos por status (toque para ver detalhes por tipo)" 
          : "Distribuição dos ativos por status (passe o mouse para ver detalhes por tipo)" }
        </CardDescription>
      </CardHeader>
      <CardContent className="flex p-[1rem] flex-row pt-0 h-full items-center">
        <div className="min-h-[250px] h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 28 : 40}
                outerRadius={isMobile ? 38 : 70}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="total"
                nameKey="status"
                label={isMobile ? false : ({ status, total }) => `${status}: ${total}`}
                labelLine={false}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout={isMobile ? "horizontal" : "vertical"}
                verticalAlign={isMobile ? "bottom" : "middle"}
                align={isMobile ? "center" : "right"}
                iconSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
