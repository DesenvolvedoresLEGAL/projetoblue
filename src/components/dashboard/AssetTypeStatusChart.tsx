
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useIsMobile } from '@/hooks/useIsMobile';

interface AssetTypeStatusChartProps {
  title: string;
  icon: React.ReactNode;
  data: {
    status: string;
    value: number;
    color: string;
  }[];
  isLoading?: boolean;
}

export const AssetTypeStatusChart: React.FC<AssetTypeStatusChartProps> = ({
  title,
  icon,
  data,
  isLoading = false
}) => {
  const isMobile = useIsMobile();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = payload[0].payload.total;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
      
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
            <div className={`${isMobile ? 'h-48' : 'h-64'} bg-gray-200 rounded`}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map(item => ({ ...item, total }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 legal-title text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="legal-text text-sm">
          Total: {total.toLocaleString()} ativos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className={`w-full ${isMobile ? 'h-48' : 'h-64'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 30 : 30}
                outerRadius={isMobile ? 50 : 70}
                paddingAngle={2}
                dataKey="value"
                nameKey="status"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="ml-4 space-y-2">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center text-sm">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-muted-foreground">{entry.status}</span>
              <span className="ml-2 font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
