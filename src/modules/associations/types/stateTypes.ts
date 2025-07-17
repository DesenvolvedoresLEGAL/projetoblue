/* eslint-disable @typescript-eslint/no-empty-object-type */
import { AssociationQueryParams } from "./apiTypes";
import { AssociationWithRelations } from "./associationsTypes";
import { AssociationCardData, AssociationSummary } from "./cardTypes";

// Estados de loading para diferentes operações
export interface LoadingStates {
  // Loading geral
  isLoading: boolean;
  // Loading específicos
  isLoadingAssociations: boolean;
  isLoadingSummary: boolean;
  isLoadingLeaseAssets: boolean;
  isLoadingSubscriptionAssets: boolean;
  isLoadingClients: boolean;
  isLoadingAssets: boolean;
  // Loading de operações
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isEnding: boolean;
}

// Estados de error para diferentes operações
export interface ErrorStates {
  // Error geral
  error: string | null;
  // Errors específicos
  associationsError: string | null;
  summaryError: string | null;
  leaseAssetsError: string | null;
  subscriptionAssetsError: string | null;
  clientsError: string | null;
  assetsError: string | null;
  // Errors de operações
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  endError: string | null;
}

// Estado completo da aplicação para associações
export interface AssociationState extends LoadingStates, ErrorStates {
  // Dados
  associations: AssociationWithRelations[];
  summary: AssociationSummary | null;
  leaseAssets: AssociationCardData | null;
  subscriptionAssets: AssociationCardData | null;
  
  // Estados de UI
  selectedAssociation: string | null;
  endingAssociationId: string | null;
  
  // Filtros aplicados
  appliedFilters: AssociationQueryParams;
  
  // Cache/timestamps para refetch
  lastUpdated: {
    associations: number | null;
    summary: number | null;
    leaseAssets: number | null;
    subscriptionAssets: number | null;
  };
}

// Hook states para React Query
export interface UseAssociationsState {
  data: AssociationWithRelations[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
  isRefetching: boolean;
}

export interface UseAssociationSummaryState {
  data: AssociationSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseLeaseAssetsState {
  data: AssociationCardData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseSubscriptionAssetsState {
  data: AssociationCardData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// Estados para operações de mutação
export interface AssociationMutationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface CreateAssociationState extends AssociationMutationState {}
export interface UpdateAssociationState extends AssociationMutationState {}
export interface DeleteAssociationState extends AssociationMutationState {}
export interface EndAssociationState extends AssociationMutationState {}

// Estados para UI components
export interface AssociationFiltersState {
  isLoading: boolean;
  error: string | null;
  manufacturers: Array<{ value: string; label: string; type: 'manufacturer' | 'operator' }>;
  associationTypes: Array<{ id: number; type: string }>;
  solutions: Array<{ id: number; solution: string }>;
}

export interface AssociationTableState {
  selectedRows: string[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
