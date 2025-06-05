
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Users, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AssociationTableRow } from "./AssociationTableRow";
import { ConfirmationModal } from "../association/ConfirmationModal";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  client_name: string;
  asset_iccid: string | null;
  asset_radio: string | null;
  asset_line_number: number | null;
  asset_solution_id: number;
  asset_solution_name: string;
}

interface AssociationGroup {
  groupKey: string;
  client_name: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  associations: Association[];
  totalAssets: number;
  assetTypes: { [key: string]: number };
  canEndGroup: boolean;
}

interface AssociationGroupRowProps {
  group: AssociationGroup;
  onEditAssociation: (association: Association) => void;
  onEndAssociation: (associationId: number) => void;
  onEndGroup: (groupKey: string) => void;
  isEndingAssociation?: boolean;
  isEndingGroup?: boolean;
}

export const AssociationGroupRow: React.FC<AssociationGroupRowProps> = ({
  group,
  onEditAssociation,
  onEndAssociation,
  onEndGroup,
  isEndingAssociation = false,
  isEndingGroup = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEndGroupConfirmation, setShowEndGroupConfirmation] = useState(false);

  // Função para formatar datas corrigindo o problema de timezone
  const formatDateCorrect = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Função para gerar resumo dos tipos de ativos
  const getAssetTypesSummary = () => {
    const types = Object.entries(group.assetTypes)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
    return types;
  };

  // Função para obter status do grupo baseado nas datas
  const getGroupStatus = () => {
    if (!group.exit_date) return 'Ativa';
    
    const today = new Date().toISOString().split('T')[0];
    const exitDate = group.exit_date;
    
    if (exitDate < today) return 'Encerrada';
    if (exitDate === today) return 'Encerra Hoje';
    return 'Ativa';
  };

  // Calcular quantas associações ativas existem no grupo
  const getActiveAssociationsCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return group.associations.filter(a => !a.exit_date || a.exit_date > today).length;
  };

  const handleEndGroup = () => {
    console.log('[AssociationGroupRow] Confirmando encerramento do grupo:', group.groupKey);
    onEndGroup(group.groupKey);
    setShowEndGroupConfirmation(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const groupStatus = getGroupStatus();
  const activeAssociationsCount = getActiveAssociationsCount();

  return (
    <>
      {/* Linha principal do grupo */}
      <TableRow className="bg-muted/30 hover:bg-muted/50 font-medium">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="p-1 h-6 w-6"
            disabled={isEndingGroup}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">{group.client_name}</span>
            <Badge variant="secondary" className="text-xs">
              {group.totalAssets} ativo{group.totalAssets > 1 ? 's' : ''}
            </Badge>
            {activeAssociationsCount > 0 && activeAssociationsCount < group.totalAssets && (
              <Badge variant="outline" className="text-xs">
                {activeAssociationsCount} ativa{activeAssociationsCount > 1 ? 's' : ''}
              </Badge>
            )}
            {isEndingGroup && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                Encerrando...
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {getAssetTypesSummary()}
          </div>
        </TableCell>

        <TableCell>
          {formatDateCorrect(group.entry_date)}
        </TableCell>

        <TableCell>
          {formatDateCorrect(group.exit_date)}
        </TableCell>

        <TableCell>
          <Badge 
            variant={
              groupStatus === 'Ativa' ? 'default' : 
              groupStatus === 'Encerra Hoje' ? 'secondary' : 
              'outline'
            }
          >
            {groupStatus}
          </Badge>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            {group.canEndGroup && activeAssociationsCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEndGroupConfirmation(true)}
                disabled={isEndingGroup || isEndingAssociation}
                className="h-8 px-3 hover:bg-destructive/10 text-destructive hover:text-destructive disabled:opacity-50"
                title={`Encerrar ${activeAssociationsCount} associação${activeAssociationsCount > 1 ? 'ões' : ''} ativa${activeAssociationsCount > 1 ? 's' : ''}`}
              >
                {isEndingGroup ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Encerrando...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Encerrar Grupo
                  </>
                )}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Linhas expandidas com detalhes individuais */}
      {isExpanded && group.associations.map((association) => (
        <AssociationTableRow
          key={association.id}
          association={association}
          onEdit={onEditAssociation}
          onEndAssociation={onEndAssociation}
          isEndingAssociation={isEndingAssociation}
        />
      ))}

      {/* Modal de confirmação para encerrar grupo */}
      <ConfirmationModal
        open={showEndGroupConfirmation}
        onOpenChange={setShowEndGroupConfirmation}
        onConfirm={handleEndGroup}
        title="Encerrar Grupo de Associações"
        description={`Tem certeza que deseja encerrar ${activeAssociationsCount} associação${activeAssociationsCount > 1 ? 'ões' : ''} ativa${activeAssociationsCount > 1 ? 's' : ''} do cliente ${group.client_name}? Esta ação encerrará todas as associações ativas simultaneamente e definirá seus ativos como disponíveis.`}
        confirmText="Encerrar Grupo"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
};
