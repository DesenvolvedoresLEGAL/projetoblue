
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface RefactoredAssetStatusDistributionCardProps {
  dashboardStats: any;
}

export const RefactoredAssetStatusDistributionCard: React.FC<RefactoredAssetStatusDistributionCardProps> = ({ 
  dashboardStats 
}) => {
  // Tooltip personalizada para mostrar detalhamento por tipo dentro de cada status
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const status = payload[0].payload.status;
      const total = payload[0].payload.total;
      
      // Busca todos os tipos que existem neste status
      const typeInfo = dashboardStats.data?.detailedStatusData
        ?.filter((item: any) => item.status === status)
        ?.map((item: any) => `${item.type}: ${item.total}`)
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

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Ativos por Status
        </CardTitle>
        <CardDescription>
          Distribuição dos ativos por status (passe o mouse para ver detalhes por tipo)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex p-[1rem] flex-row pt-0 h-full items-center">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={window.innerWidth <= 640 ? 28 : 40}
                outerRadius={window.innerWidth <= 640 ? 38 : 70}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="total"
                nameKey="status"
                label={window.innerWidth <= 640 ? false : ({ status, total }) => `${status}: ${total}`}
                labelLine={false}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout={window.innerWidth <= 640 ? "horizontal" : "vertical"}
                verticalAlign={window.innerWidth <= 640 ? "bottom" : "middle"}
                align={window.innerWidth <= 640 ? "center" : "right"}
                iconSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
