
// Tipos para a nova estrutura de clientes
export interface Client {
  uuid: string;
  empresa: string;
  responsavel: string;
  telefones: string[]; // Array de telefones
  email?: string;
  cnpj?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Campos legados mantidos para compatibilidade durante transição
  nome?: string;
  contato?: number;
}

export interface ClientFormData {
  empresa: string;
  responsavel: string;
  telefones: string[];
  email?: string;
  cnpj?: string;
}

export interface ClientCreateData {
  empresa: string;
  responsavel: string;
  telefones: string[];
  email?: string;
  cnpj?: string;
}

export interface ClientUpdateData {
  empresa?: string;
  responsavel?: string;
  telefones?: string[];
  email?: string;
  cnpj?: string;
}
