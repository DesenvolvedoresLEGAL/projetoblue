
import { v4 as uuidv4 } from "uuid";
import { Client } from "@/types/asset";

export const getClientById = (clients: Client[], uuid: string) => {
  // Corrigido para usar uuid em vez de id, conforme banco
  return clients.find(client => client.uuid === uuid);
};

export const createClient = (clientData: Omit<Client, "uuid">) => {
  // Corrigido para usar uuid e remover campos inexistentes no banco
  return {
    ...clientData,
    uuid: uuidv4(),
    // Removido campo 'assets' que não existe no banco
  };
};

export const updateClientInList = (clients: Client[], uuid: string, clientData: Partial<Client>): Client[] => {
  // Corrigido para usar uuid em vez de id
  return clients.map(client => 
    client.uuid === uuid ? { ...client, ...clientData } : client
  );
};
