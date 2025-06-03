
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Plus, Link, FileSpreadsheet, ChevronDown } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleExport = (format: 'csv' | 'excel') => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="legal-title">Ações Rápidas</CardTitle>
        <CardDescription className="legal-text">
          Acesso direto às funcionalidades principais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => navigate('/assets/register')}
          className={`legal-button w-full ${isMobile ? 'h-12 text-base' : 'h-10'}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Ativo
        </Button>
        
        <Button 
          onClick={() => navigate('/association')}
          className={`legal-button w-full ${isMobile ? 'h-12 text-base' : 'h-10'}`}
          variant="outline"
        >
          <Link className="h-4 w-4 mr-2" />
          Nova Associação
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              className={`legal-button w-full ${isMobile ? 'h-12 text-base' : 'h-10'}`}
              variant="outline"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Dados
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              Exportar CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              Exportar Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
};
