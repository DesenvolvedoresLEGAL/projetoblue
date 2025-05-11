
import { Client } from '@/types/asset';

export const useClientOperations = (
  clients: Client[],
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
) => {

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  const addClient = (clientData: Omit<Client, "id">): void => {
    const newClient: Client = {
      id: Date.now().toString(), // In a real app, this would come from the server
      ...clientData
    };
    
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, clientData: Partial<Client>): void => {
    setClients(prev => 
      prev.map(client => 
        client.id === id ? { ...client, ...clientData } : client
      )
    );
  };

  const deleteClient = (id: string): void => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  return {
    getClientById,
    addClient,
    updateClient,
    deleteClient
  };
};
