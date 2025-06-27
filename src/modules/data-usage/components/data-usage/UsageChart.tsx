
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChipWithMetrics, GroupByOption, TimeRange } from "@/types/dataUsage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { formatDataSize } from "@/utils/formatDataSize";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface UsageChartProps {
  data: ChipWithMetrics[];
  timeRange: TimeRange;
  groupBy: GroupByOption;
  chartData: ChartDataPoint[];
  formatLabel: (value: string) => string;
  startDate?: Date;
  endDate?: Date;
}

interface ChartDataPoint {
  name: string;
  download: number;
  upload: number;
  quality?: string;
  carrier?: string;
  iccid?: string;
  clientName?: string;
}

export const UsageChart: React.FC<UsageChartProps> = ({
  data,
  timeRange,
  groupBy,
  chartData,
  formatLabel,
  startDate,
  endDate
}) => {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Consumo</CardTitle>
          <CardDescription>
            Nenhum dado encontrado com os filtros selecionados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Tente ajustar os filtros para visualizar dados de consumo.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getPeriodDescription = () => {
    switch (timeRange) {
      case '24h':
        return 'últimas 24 horas';
      case '7d':
        return 'últimos 7 dias';
      case '30d':
        return 'últimos 30 dias';
      case 'custom':
        if (startDate && endDate) {
          return `${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')}`;
        }
        return 'período personalizado';
    }
  };

  const getGroupDescription = () => {
    switch (groupBy) {
      case 'CHIP':
        return 'chip';
      case 'CLIENTE':
        return 'cliente';
      case 'OPERADORA':
        return 'operadora';
      case 'REGIAO':
        return 'região';
    }
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-lg">
          <p className="font-medium">{formatLabel(label)}</p>
          <div className="mt-2 space-y-1">
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-500">
                  {entry.name === 'download' ? 'Download' : 'Upload'}:
                </span>
                <span className="text-sm font-medium">
                  {formatDataSize(entry.value as number)}
                </span>
              </div>
            ))}
            
            {item.quality && (
              <div className="mt-1 pt-1 border-t text-sm">
                <span 
                  className={
                    item.quality === 'GOOD' ? 'text-green-600' :
                    item.quality === 'UNSTABLE' ? 'text-yellow-600' : 'text-red-600'
                  }
                >
                  Sinal: {
                    item.quality === 'GOOD' ? 'Bom' :
                    item.quality === 'UNSTABLE' ? 'Instável' : 'Ruim'
                  }
                </span>
              </div>
            )}
            
            {item.carrier && (
              <div className="text-sm text-gray-500">
                Operadora: {item.carrier}
              </div>
            )}
            
            {item.iccid && (
              <div className="text-sm text-gray-500">
                ICCID: {item.iccid}
              </div>
            )}
          </div>
        </div>
      );
    }
  
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Consumo</CardTitle>
        <CardDescription>
          Tendências de consumo por {getGroupDescription()} ({getPeriodDescription()})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickFormatter={formatLabel}
              />
              <YAxis 
                tickFormatter={(value) => formatDataSize(value as number, true)} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="download"
                name="Download"
                stroke="#1E88E5"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="upload"
                name="Upload"
                stroke="#43A047"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
