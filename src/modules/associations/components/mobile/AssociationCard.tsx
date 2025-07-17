
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Users, Phone, Building } from 'lucide-react';
import { ClientAssociationGroup } from '../../types/associationsTypes';
import { formatPhone } from '../../utils/associationFormatters';
import { SearchResultHighlight } from '../SearchResultHighlight';
import ChipTypeIndicator from '../ChipTypeIndicator';
import MobileExpandedView from './MobileExpandedView';

interface AssociationCardProps {
  group: ClientAssociationGroup;
  onEndAssociation: (association: unknown) => void;
  endingAssociationId: string | null;
  searchTerm: string;
  searchType: string;
}

const AssociationCard: React.FC<AssociationCardProps> = ({
  group,
  onEndAssociation,
  endingAssociationId,
  searchTerm,
  searchType
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden animate-fade-in">
      {/* Header do card */}
      <div 
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors active:bg-muted/50"
        onClick={toggleExpanded}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Nome e empresa */}
            <div className="mb-2">
              <h3 className="font-medium text-foreground text-base leading-tight">
                <SearchResultHighlight
                  text={group.client.nome}
                  searchTerm={searchType === 'client_name' ? searchTerm : ''}
                />
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Building className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  <SearchResultHighlight
                    text={group.client.empresa}
                    searchTerm={searchType === 'client_name' ? searchTerm : ''}
                  />
                </span>
              </div>
            </div>

            {/* Informações principais */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">{group.totalAssociations}</span>
                <span className="text-muted-foreground">assoc.</span>
              </div>
              
              <div className="text-green-600 text-xs">
                {group.activeAssociations} ativas
              </div>
              
              {group.inactiveAssociations > 0 && (
                <div className="text-muted-foreground text-xs">
                  {group.inactiveAssociations} inativas
                </div>
              )}
            </div>

            {/* Tipos de associação */}
            <div className="flex flex-wrap gap-1 mt-2">
              {group.principalChips > 0 && (
                <ChipTypeIndicator chipType="principal" className="text-xs" />
              )}
              {group.backupChips > 0 && (
                <ChipTypeIndicator chipType="backup" className="text-xs" />
              )}
              {group.equipmentOnly > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  {group.equipmentOnly} eq.
                </span>
              )}
            </div>

            {/* Contato */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Phone className="h-3 w-3" />
              <span>{formatPhone(group.client.contato)}</span>
            </div>
          </div>

          {/* Botão expandir */}
          <div className="flex items-center ml-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="border-t bg-muted/10">
          <MobileExpandedView
            associations={group.associations}
            clientName={group.client.nome}
            onEndAssociation={onEndAssociation}
            endingAssociationId={endingAssociationId}
          />
        </div>
      )}
    </div>
  );
};

export default AssociationCard;
