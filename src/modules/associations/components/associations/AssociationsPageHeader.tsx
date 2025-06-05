
import React from 'react';
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Clock, FileSpreadsheet } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface AssociationsPageHeaderProps {
  totalCount?: number;
  onExport?: () => void;
  isExporting?: boolean;
}

export const AssociationsPageHeader: React.FC<AssociationsPageHeaderProps> = ({
  totalCount = 0,
  onExport,
  isExporting = false
}) => {
  const navigate = useNavigate();

  return (
    <StandardPageHeader
      icon={Users}
      title="Gestão de Associações"
      description="Controle completo de associações ativas entre ativos e clientes"
    >
      <div className="flex items-center gap-3">
        {onExport && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExport}
            disabled={isExporting || totalCount === 0}
            className="flex items-center gap-2 border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB] hover:text-white font-neue-haas"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>
        )}
        
        <Badge 
          variant="outline" 
          className="text-xs border-[#03F9FF] text-[#020CBC] font-neue-haas"
        >
          <Clock className="h-3 w-3 mr-1" />
          {totalCount} associações encontradas
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    </StandardPageHeader>
  );
};
