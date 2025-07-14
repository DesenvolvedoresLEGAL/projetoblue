
import { v4 as uuidv4 } from "uuid";
import { Client, ClientCreateData } from "@/types/client";
export const getClientById = (clients: Client[], uuid: string) => {
  return clients.find(client => client.uuid === uuid);
};

export const createClient = (clientData: ClientCreateData): Client => {
  return {
    uuid: uuidv4(),
    empresa: clientData.empresa,
    responsavel: clientData.responsavel,
    telefones: clientData.telefones,
    email: clientData.email || '',
    cnpj: clientData.cnpj,
    nome: clientData.nome || '',
    contato: clientData.contato || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: undefined
  };
};

export const updateClientInList = (clients: Client[], uuid: string, clientData: Partial<Client>): Client[] => {
  return clients.map(client => 
    client.uuid === uuid ? { ...client, ...clientData, updated_at: new Date().toISOString() } : client
  );
};
