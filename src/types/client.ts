
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
