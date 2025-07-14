/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Client {
  uuid: string;
  nome: string;
  empresa: string;
  responsavel: string;
  contato: string; // Mudando de number para string para consistência
  email?: string;
  cnpj?: string;
  telefones?: any;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ClientCreateData {
  nome: string;
  empresa: string;
  responsavel: string;
  contato: string;
  email?: string;
  cnpj?: string;
  telefones?: any;
}
