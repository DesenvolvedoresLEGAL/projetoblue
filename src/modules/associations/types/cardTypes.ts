
import { ASSOCIATION_TYPES } from './constants';

// Interface para dados agregados por tipo de solução nos cards
export interface AssociationCardData {
  chips: number;
  speedys: number;
  equipments: number;
  total: number;
}

// Interface para resumo/contadores de associações
export interface AssociationSummary {
  totalAssociations: number;
  activeAssociations: number;
  inactiveAssociations: number;
  leaseAssociations: number;
  subscriptionAssociations: number;
  totalClients: number;
  // Breakdown por tipo de solução
  solutionBreakdown: {
    chips: number;
    speedys: number;
    equipments: number;
  };
  // Breakdown por tipo de associação
  associationTypeBreakdown: {
    lease: AssociationCardData;
    subscription: AssociationCardData;
  };
}

// Interface para dados de associação individual para cards
export interface AssociationCardItem {
  uuid: string;
  clientName: string;
  clientId: string;
  entryDate: string;
  exitDate?: string;
  associationType: typeof ASSOCIATION_TYPES[keyof typeof ASSOCIATION_TYPES];
  isActive: boolean;
  // Assets relacionados
  equipment?: {
    uuid: string;
    model?: string;
    radio?: string;
    solution: string;
  };
  chip?: {
    uuid: string;
    iccid?: string;
    lineNumber?: number;
    solution: string;
  };
  // Configurações específicas
  equipmentSsid?: string;
  equipmentPass?: string;
  planGb?: number;
  notes?: string;
}

// Interface para agrupamento de associações por cliente nos cards
export interface ClientAssociationCard {
  clientId: string;
  clientName: string;
  clientCompany: string;
  totalAssociations: number;
  activeAssociations: number;
  associations: AssociationCardItem[];
  // Contadores por tipo
  leaseCount: number;
  subscriptionCount: number;
  // Contadores por solução
  chipsCount: number;
  speedysCount: number;
  equipmentsCount: number;
}
