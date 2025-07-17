/* eslint-disable @typescript-eslint/no-empty-object-type */

import { AssociationCardData, AssociationSummary } from './cardTypes';
import { AssociationWithRelations, Client, Asset } from './associationsTypes';


// Tipos base para respostas da API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Tipos específicos para respostas de associações
export interface AssociationsApiResponse extends ApiResponse<AssociationWithRelations[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssociationSummaryApiResponse extends ApiResponse<AssociationSummary> {}

export interface LeaseAssetsApiResponse extends ApiResponse<AssociationCardData> {}

export interface SubscriptionAssetsApiResponse extends ApiResponse<AssociationCardData> {}

// Tipos para dados brutos vindos do banco (com JOINs)
export interface AssociationRawData {
  uuid: string;
  client_id: string;
  equipment_id?: string;
  chip_id?: string;
  entry_date: string;
  exit_date?: string;
  association_type_id: number;
  plan_id?: number;
  plan_gb?: number;
  equipment_ssid?: string;
  equipment_pass?: string;
  status: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Dados do cliente (JOIN)
  client: {
    uuid: string;
    nome: string;
    empresa: string;
    responsavel: string;
    contato: string;
    email?: string;
    cnpj?: string;
  };
  // Dados do equipamento (JOIN)
  equipment?: {
    uuid: string;
    model?: string;
    serial_number?: string;
    radio?: string;
    solution_id?: number;
    manufacturer_id?: number;
    status_id?: number;
    manufacturer?: {
      id: number;
      name: string;
      country?: string;
    };
    solution?: {
      id: number;
      solution: string;
    };
    status?: {
      id: number;
      status: string;
    };
  };
  // Dados do chip (JOIN)
  chip?: {
    uuid: string;
    iccid?: string;
    line_number?: number;
    radio?: string;
    solution_id?: number;
    manufacturer_id?: number;
    status_id?: number;
    manufacturer?: {
      id: number;
      name: string;
      country?: string;
    };
    solution?: {
      id: number;
      solution: string;
    };
    status?: {
      id: number;
      status: string;
    };
  };
  // Dados do plano (JOIN)
  plan?: {
    id: number;
    nome: string;
    tamanho_gb?: number;
  };
}

// Tipos para parâmetros de consulta
export interface AssociationQueryParams {
  associationType?: number;
  status?: 'active' | 'inactive' | 'all';
  clientId?: string;
  assetType?: 'equipment' | 'chip' | 'all';
  manufacturerId?: number;
  solutionId?: number;
  entryDateFrom?: string;
  entryDateTo?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'entry_date' | 'client_name' | 'created_at';
  orderDirection?: 'asc' | 'desc';
}

// Tipos para criação/atualização de associações
export interface CreateAssociationRequest {
  client_id: string;
  equipment_id?: string;
  chip_id?: string;
  entry_date: string;
  exit_date?: string;
  association_type_id: number;
  plan_id?: number;
  plan_gb?: number;
  equipment_ssid?: string;
  equipment_pass?: string;
  notes?: string;
}

export interface UpdateAssociationRequest extends Partial<CreateAssociationRequest> {
  uuid: string;
}

export interface EndAssociationRequest {
  uuid: string;
  exit_date: string;
  notes?: string;
}
