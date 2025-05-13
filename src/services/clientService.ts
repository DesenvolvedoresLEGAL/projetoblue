
import { Client } from "@/types/asset";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { ClientRecord } from "@/types/assetDatabase";

export const clientService = {
  async fetchClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      
      if (error) {
        console.error('Error fetching clients:', error);
        return [];
      }
      
      // Convert database records to Client objects
      const clients = data.map(record => {
        const client: ClientRecord = record as ClientRecord;
        return {
          id: client.uuid,
          name: client.nome,
          document: client.cnpj,
          documentType: "CNPJ", // Always CNPJ in this schema
          contact: client.contato.toString(),
          email: client.email || "",
          address: "",  // Not available in current schema
          city: "",     // Not available in current schema
          state: "",    // Not available in current schema
          zipCode: "",  // Not available in current schema
          assets: []    // Will be populated later by associations
        } as Client;
      });
      
      return clients;
    } catch (error) {
      console.error('Error in fetchClients:', error);
      return [];
    }
  },
  
  getClientById(clients: Client[], id: string): Client | undefined {
    return clients.find(client => client.id === id);
  },
  
  async fetchAssetClientAssociations(clients: Client[]): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('asset_client_assoc')
        .select('*');
      
      if (error) {
        console.error('Error fetching asset-client associations:', error);
        return;
      }
      
      // Map assets to clients
      const clientMap: Record<string, string[]> = {};
      
      data.forEach((assoc: any) => {
        const clientId = assoc.client_id;
        const assetId = assoc.asset_id;
        
        if (!clientMap[clientId]) {
          clientMap[clientId] = [];
        }
        
        if (!clientMap[clientId].includes(assetId)) {
          clientMap[clientId].push(assetId);
        }
      });
      
      // Update clients with their associated assets
      clients.forEach(client => {
        if (clientMap[client.id]) {
          client.assets = clientMap[client.id];
        }
      });
    } catch (error) {
      console.error('Error in fetchAssetClientAssociations:', error);
    }
  }
};
