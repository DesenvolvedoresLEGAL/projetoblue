
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileSpreadsheet, Layers } from "lucide-react";

interface UsageHeaderProps {
  handleExport: () => void;
  viewType: "cards" | "chart";
  setViewType: (type: "cards" | "chart") => void;
}

export const UsageHeader: React.FC<UsageHeaderProps> = ({
  handleExport,
  viewType,
  setViewType
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Consumo de Dados</h1>
        <p className="text-gray-500">Monitoramento de consumo dos chips ativos em campo</p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleExport}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar para Excel
        </Button>
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as "cards" | "chart")}>
          <TabsList>
            <TabsTrigger value="chart">
              <BarChart3 className="h-4 w-4 mr-2" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger value="cards">
              <Layers className="h-4 w-4 mr-2" />
              Cartões
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
