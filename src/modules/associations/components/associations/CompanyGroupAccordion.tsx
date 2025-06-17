
import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, MapPin, Users } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyGroup } from '@/utils/timestampGroupingUtils';
import { Association, AssociationGroup } from '@/types/associations';
import { AssociationTableRow } from './AssociationTableRow';
import { GroupActionsToolbar } from './GroupActionsToolbar';

interface CompanyGroupAccordionProps {
  companyGroups: CompanyGroup[];
  onEditAssociation: (association: Association) => void;
  onEndAssociation: (associationId: number) => void;
  onEndGroup: (groupKey: string) => void;
  debouncedSearchTerm: string;
  isEndingAssociation: boolean;
  isEndingGroup: boolean;
}

export const CompanyGroupAccordion: React.FC<CompanyGroupAccordionProps> = ({
  companyGroups,
  onEditAssociation,
  onEndAssociation,
  onEndGroup,
  debouncedSearchTerm,
  isEndingAssociation,
  isEndingGroup
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

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

  const getAssetTypesSummary = (assetTypes: { [key: string]: number }) => {
    return Object.entries(assetTypes)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };

  const getActiveAssociationsCount = (associations: Association[]) => {
    const today = new Date().toISOString().split('T')[0];
    return associations.filter(a => !a.exit_date || a.exit_date > today).length;
  };

  // Convert CompanyGroup to AssociationGroup for toolbar
  const convertToAssociationGroup = (group: CompanyGroup): AssociationGroup => {
    const activeCount = getActiveAssociationsCount(group.associations);
    
    return {
      groupKey: group.clientId, // Use clientId as groupKey
      client_name: group.clientName,
      client_id: group.clientId,
      entry_date: group.entryDate,
      exit_date: group.exitDate || null,
      associations: group.associations,
      totalAssets: group.associations.length,
      assetTypes: group.assetTypeDistribution,
      canEndGroup: activeCount > 0
    };
  };

  return (
    <Accordion 
      type="multiple" 
      value={openItems} 
      onValueChange={setOpenItems}
      className="space-y-4"
    >
      {companyGroups.map((group) => {
        const activeCount = getActiveAssociationsCount(group.associations);
        const associationGroup = convertToAssociationGroup(group);
        
        return (
          <AccordionItem 
            key={group.clientId} 
            value={group.clientId}
            className="border border-gray-200 rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {group.clientName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.associations.length} ativo{group.associations.length > 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateCorrect(group.entryDate)}
                      </span>
                      {group.exitDate && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          até {formatDateCorrect(group.exitDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getAssetTypesSummary(group.assetTypeDistribution)}
                  </Badge>
                  {activeCount > 0 && activeCount < group.associations.length && (
                    <Badge variant="outline" className="text-xs">
                      {activeCount} ativa{activeCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                {/* Toolbar de Ações do Grupo */}
                <div className="flex justify-end border-b pb-3">
                  <GroupActionsToolbar
                    group={associationGroup}
                    onEndGroup={onEndGroup}
                    isEndingGroup={isEndingGroup}
                  />
                </div>

                {/* Lista de Associações */}
                <div className="space-y-2">
                  {group.associations.map((association) => (
                    <div key={association.id} className="border rounded-lg p-3 bg-gray-50">
                      <AssociationTableRow
                        association={association}
                        onEdit={onEditAssociation}
                        onEndAssociation={onEndAssociation}
                        isEndingAssociation={isEndingAssociation}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
