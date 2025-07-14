export interface Client {
  uuid: string;
  nome: string;
  empresa: string;
  responsavel: string;
  contato: string;
  email?: string;
  cnpj?: string;
  telefones: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateClientRequest {
  nome: string;
  empresa: string;
  responsavel: string;
  contato: number;
  email?: string;
  cnpj?: string;
  telefones: string[];
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  uuid: string;
}

export interface Client {
  uuid: string;
  nome: string;
  empresa: string;
  responsavel: string;
  contato: number;
  email?: string;
  cnpj?: string;
  telefones: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateClientRequest {
  nome: string;
  empresa: string;
  responsavel: string;
  contato: number;
  email?: string;
  cnpj?: string;
  telefones: string[];
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  uuid: string;
}

// Define ClientCreateData type here if not exported from "@/types/client"
export type ClientCreateData = {
  nome: string;
  contato: string;
  empresa: string;
  responsavel: string;
  telefones: string[];
  email?: string;
  cnpj: string;
};