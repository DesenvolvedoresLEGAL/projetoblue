
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Download, Upload } from "lucide-react";
import { ChipWithMetrics } from "@/types/dataUsage";
import { formatDataSize } from "@/utils/formatDataSize";

interface UsageMetricCardsProps {
  filteredChips: ChipWithMetrics[];
}

export const UsageMetricCards: React.FC<UsageMetricCardsProps> = ({ filteredChips }) => {
  const totalDownload = filteredChips.reduce((sum, chip) => sum + (chip.metrics?.download || 0), 0);
  const totalUpload = filteredChips.reduce((sum, chip) => sum + (chip.metrics?.upload || 0), 0);
  const totalChips = filteredChips.length;
  const chipsWithIssues = filteredChips.filter(
    chip => chip.quality?.status === 'UNSTABLE' || chip.quality?.status === 'POOR'
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Download</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Download className="h-5 w-5 text-blue-500 mr-2" />
            <div className="text-2xl font-bold">
              {formatDataSize(totalDownload)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Upload className="h-5 w-5 text-green-500 mr-2" />
            <div className="text-2xl font-bold">
              {formatDataSize(totalUpload)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Chips Monitorados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-500 mr-2" />
            <div className="text-2xl font-bold">
              {totalChips}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`md:col-span-1 ${chipsWithIssues > 0 ? 'border-yellow-300 bg-yellow-50' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Chips com Instabilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className={`h-5 w-5 mr-2 rounded-full flex items-center justify-center 
              ${chipsWithIssues > 0 ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>
              !
            </div>
            <div className="text-2xl font-bold">
              {chipsWithIssues}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
