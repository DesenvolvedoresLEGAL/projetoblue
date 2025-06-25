
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Plus, Link, FileSpreadsheet, ChevronDown } from "lucide-react";
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePermissions } from '@/hooks/usePermissions';
import { RoleGuard } from '@/components/auth/RoleGuard';
import * as XLSX from 'xlsx';
import { assetService } from '@modules/assets/services/assetService';
import { useAssetsData } from '@modules/assets/hooks/useAssetsData';

export const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const assets = useAssetsData();
  const { canCreateAssets, canManageAssociations, canExportData } = usePermissions();

  const handleImportCSV = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('IMPORT CSV');
    }
  };

  const handleExport = (format: 'csv' | 'excel') => {
    try {
      const data = assets.data.assets;
      const fileName = "ATIVOS";

      if (!data || !Array.isArray(data) || data.length === 0) {
        alert("Não há dados para exportar.");
        return;
      }

      const flattenedData = data.map(asset => ({
        model: asset.model,
        rented_days: asset.rented_days,
        serial_number: asset.serial_number,
        radio: asset.radio,
        admin_user: asset.admin_user,
        admin_pass: asset.admin_pass,
        ssid_atual: asset.ssid_atual,
        pass_atual: asset.pass_atual,
        manufacturer_name: asset.manufacturer?.name ?? "",
        status_name: asset.status?.name ?? "",
        solucao_name: asset.solucao?.name ?? "",
        plan_name: asset.plan?.name ?? ""
      }));

      if (format === 'csv') {
        const headers = Object.keys(flattenedData[0]);
        const csvRows = [
          headers.join(','),
          ...flattenedData.map(row =>
            headers.map(field => {
              let cell = row[field];
              if (cell == null) cell = "";
              if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                cell = `"${cell.replace(/"/g, '""')}"`;
              }
              return cell;
            }).join(',')
          )
        ];
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(flattenedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Exportação");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`ERRO DE EXPORTAÇÃO:===>>>> ${error}`);
      }
    }
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
        <RoleGuard requiredRole="suporte">
          <Button 
            onClick={() => navigate('/assets/register')}
            className={`legal-button w-full ${isMobile ? 'h-12 text-base' : 'h-10'}`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Ativo
          </Button>
        </RoleGuard>
        
        <RoleGuard requiredRole="suporte">
          <Button 
            onClick={() => navigate('/association')}
            className={`legal-button w-full ${isMobile ? 'h-12 text-base' : 'h-10'}`}
            variant="outline"
          >
            <Link className="h-4 w-4 mr-2" />
            Nova Associação
          </Button>
        </RoleGuard>

        <RoleGuard requiredRole="suporte">
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
        </RoleGuard>

        <RoleGuard requiredRole="suporte">
          <Button 
            className={`legal-button w-full ${isMobile ? 'h-12 text-base' : 'h-10'}`}
            variant="outline"
            onClick={() => handleImportCSV()}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Importar Dados (.csv)
          </Button>
        </RoleGuard>
      </CardContent>
    </Card>
  );
};
