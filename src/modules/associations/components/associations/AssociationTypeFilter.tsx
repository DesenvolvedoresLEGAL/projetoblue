
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, CreditCard, Package, RotateCcw } from "lucide-react";

interface AssociationTypeFilterProps {
  associationType: string;
  onAssociationTypeChange: (type: string) => void;
}

export const AssociationTypeFilter: React.FC<AssociationTypeFilterProps> = ({
  associationType,
  onAssociationTypeChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-[#03F9FF]" />
        <span className="text-sm font-medium text-[#020CBC] font-neue-haas">Tipo de Associação:</span>
      </div>
      
      <Tabs value={associationType} onValueChange={onAssociationTypeChange} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-white border border-[#4D2BFB]/20">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-[#4D2BFB] data-[state=active]:text-white font-neue-haas"
          >
            <div className="flex items-center gap-1">
              <RotateCcw className="h-3 w-3" />
              <span>Todos</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="1" 
            className="data-[state=active]:bg-orange-500 data-[state=active]:text-white font-neue-haas"
          >
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span>Locação</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="2" 
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white font-neue-haas"
          >
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span>Assinatura</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="other" 
            className="data-[state=active]:bg-gray-500 data-[state=active]:text-white font-neue-haas"
          >
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span>Outros</span>
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Legenda visual */}
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
            <Building2 className="h-3 w-3 mr-1" />
            Em Locação
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CreditCard className="h-3 w-3 mr-1" />
            Em Assinatura
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
            <Package className="h-3 w-3 mr-1" />
            Outros
          </Badge>
        </div>
      </div>
    </div>
  );
};
