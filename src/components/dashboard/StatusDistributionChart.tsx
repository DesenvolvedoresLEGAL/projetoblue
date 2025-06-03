
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';

interface StatusDistributionChartProps {
  data: {
    status: string;
    value: number;
    color: string;
  }[];
  isLoading?: boolean;
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data,
  isLoading = false
}) => {
  const isMobile = useIsMobile();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / data.total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <div className="font-semibold text-gray-900 mb-1">
            {data.status}: {data.value} ativos
          </div>
          <div className="text-sm text-gray-600">
            {percentage}% do total
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map(item => ({ ...item, total }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 legal-title">
          <PieChartIcon className="h-5 w-5 text-[#4D2BFB]" />
          Distribuição por Status
        </CardTitle>
        <CardDescription className="legal-text">
          {isMobile ? 
            "Distribuição dos ativos por status (toque para ver detalhes)" 
            : "Distribuição dos ativos por status (passe o mouse para ver detalhes)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className={`w-full ${isMobile ? 'h-64' : 'h-80'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 30 : 50}
                outerRadius={isMobile ? 80 : 120}
                paddingAngle={5}
                dataKey="value"
                nameKey="status"
                label={!isMobile ? ({ status, value }) => `${status}: ${value}` : false}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout={isMobile ? "horizontal" : "vertical"}
                verticalAlign={isMobile ? "bottom" : "middle"}
                align={isMobile ? "center" : "right"}
                iconSize={12}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
