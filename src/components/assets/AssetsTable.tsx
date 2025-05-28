
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssetWithRelations } from '@/hooks/useAssetsData';
import EditAssetDialog from './EditAssetDialog';
import DeleteAssetDialog from './DeleteAssetDialog';
import AssetDetailsDialog from './AssetDetailsDialog';
import AssetStatusBadge from './AssetStatusBadge';

interface AssetsTableProps {
  assets: AssetWithRelations[];
  onAssetUpdated: () => void;
  onAssetDeleted: () => void;
  currentPage?: number;
  pageSize?: number;
}

const AssetsTable = ({ 
  assets, 
  onAssetUpdated, 
  onAssetDeleted,
  currentPage = 1,
  pageSize = 10 
}: AssetsTableProps) => {
  const [selectedAsset, setSelectedAsset] = useState<AssetWithRelations | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Função para abrir modal de edição
  const handleEditAsset = (asset: AssetWithRelations) => {
    console.log('🖋️ Abrindo modal de edição para asset:', asset.uuid);
    setSelectedAsset(asset);
    setIsEditDialogOpen(true);
  };

  // Função para abrir modal de deleção
  const handleDeleteAsset = (asset: AssetWithRelations) => {
    console.log('🗑️ Abrindo modal de deleção para asset:', asset.uuid);
    setSelectedAsset(asset);
    setIsDeleteDialogOpen(true);
  };

  // Função para abrir modal de detalhes
  const handleViewDetails = (asset: AssetWithRelations) => {
    console.log('👁️ Abrindo detalhes para asset:', asset.uuid);
    setSelectedAsset(asset);
    setIsDetailsDialogOpen(true);
  };

  // Função para fechar modals e limpar seleção
  const handleCloseModals = () => {
    console.log('🚪 Fechando modals e limpando seleção');
    setSelectedAsset(null);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsDetailsDialogOpen(false);
  };

  // Callback para quando asset é atualizado com sucesso
  const handleAssetUpdatedSuccess = () => {
    console.log('✅ Asset atualizado com sucesso, fechando modal e atualizando lista');
    handleCloseModals();
    onAssetUpdated();
  };

  // Callback para quando asset é deletado com sucesso
  const handleAssetDeletedSuccess = () => {
    console.log('✅ Asset deletado com sucesso, fechando modal e atualizando lista');
    handleCloseModals();
    onAssetDeleted();
  };

  // Função para renderizar o identificador do asset
  const renderAssetIdentifier = (asset: AssetWithRelations) => {
    if (asset.solucao?.id === 11) {
      // Para CHIPs, mostrar últimos 5 dígitos do ICCID
      return asset.iccid ? `...${asset.iccid.slice(-5)}` : 'N/A';
    } else {
      // Para outros assets, mostrar rádio ou serial number
      return asset.radio || asset.serial_number || asset.uuid.substring(0, 8);
    }
  };

  // Função para renderizar detalhes específicos do asset
  const renderAssetDetails = (asset: AssetWithRelations) => {
    if (asset.solucao?.id === 11) {
      // CHIP details
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">{asset.solucao.name}</div>
          <div className="text-xs text-muted-foreground">
            {asset.manufacturer?.name || 'Operadora N/A'}
          </div>
          {asset.line_number && (
            <div className="text-xs text-muted-foreground">
              Tel: {asset.line_number}
            </div>
          )}
        </div>
      );
    } else {
      // Device details
      return (
        <div className="space-y-1">
          <div className="text-sm font-medium">{asset.solucao?.name || 'Dispositivo'}</div>
          <div className="text-xs text-muted-foreground">
            {asset.manufacturer?.name || 'Fabricante N/A'}
          </div>
          {asset.model && (
            <div className="text-xs text-muted-foreground">
              Modelo: {asset.model}
            </div>
          )}
        </div>
      );
    }
  };

  if (!assets || assets.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Nenhum ativo encontrado</p>
            <p className="text-sm text-muted-foreground">
              Ajuste os filtros ou adicione novos ativos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.uuid} className="hover:bg-muted/50">
                    <TableCell>
                      <Badge variant="outline">
                        {asset.solucao?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="font-medium">
                      {renderAssetIdentifier(asset)}
                    </TableCell>
                    
                    <TableCell>
                      {renderAssetDetails(asset)}
                    </TableCell>
                    
                    <TableCell>
                      <AssetStatusBadge status={asset.status?.name || 'Desconhecido'} />
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(asset.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleViewDetails(asset)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAsset(asset)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <EditAssetDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseModals}
        asset={selectedAsset}
        onAssetUpdated={handleAssetUpdatedSuccess}
      />

      {/* Modal de Deleção */}
      <DeleteAssetDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseModals}
        asset={selectedAsset}
        onAssetDeleted={handleAssetDeletedSuccess}
      />

      {/* Modal de Detalhes */}
      <AssetDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseModals}
        asset={selectedAsset}
      />
    </>
  );
};

export default AssetsTable;
