
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWizard } from "../WizardContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AlertCircle, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const AssetAssociationForm: React.FC = () => {
  const { assetData, updateAssetData } = useWizard();
  const [clients, setClients] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [associateToClient, setAssociateToClient] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('uuid, nome');
          
        if (clientsError) throw clientsError;
        setClients(clientsData || []);
        
        // Fetch locations
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('id, name');
          
        if (locationsError) throw locationsError;
        setLocations(locationsData || []);
      } catch (err) {
        console.error("Error fetching association data:", err);
        setError("Erro ao carregar dados de vinculação. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAssociationChange = (value: boolean) => {
    setAssociateToClient(value);
    
    // Clear association data when toggling off
    if (!value) {
      updateAssetData({
        client_id: null,
        location_id: null,
        entry_date: null,
        association_notes: null
      });
    } else {
      // Set default entry date when enabling association
      updateAssetData({
        entry_date: new Date().toISOString().split('T')[0]
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    updateAssetData({ [name]: value });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAssetData({ [name]: value });
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Carregando dados de vinculação...</div>;
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Vinculação (Opcional)
          </CardTitle>
          <CardDescription>
            Você pode vincular este ativo a um cliente agora ou fazer isso mais tarde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Switch 
              id="associate-asset"
              checked={associateToClient}
              onCheckedChange={handleAssociationChange}
            />
            <Label htmlFor="associate-asset">
              Vincular ativo a um cliente agora
            </Label>
          </div>
          
          {associateToClient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="client_id">Cliente*</Label>
                <Select
                  value={assetData.client_id || ""}
                  onValueChange={(value) => handleSelectChange("client_id", value)}
                >
                  <SelectTrigger id="client_id">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.uuid} value={client.uuid}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location_id">Localização</Label>
                <Select
                  value={assetData.location_id?.toString() || ""}
                  onValueChange={(value) => handleSelectChange("location_id", value)}
                >
                  <SelectTrigger id="location_id">
                    <SelectValue placeholder="Selecione a localização" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="entry_date">Data de Entrada*</Label>
                <Input
                  id="entry_date"
                  name="entry_date"
                  type="date"
                  value={assetData.entry_date || new Date().toISOString().split('T')[0]}
                  onChange={handleInputChange}
                  required={associateToClient}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="association_id">Tipo de Associação*</Label>
                <Select
                  value={assetData.association_id?.toString() || ""}
                  onValueChange={(value) => handleSelectChange("association_id", value)}
                >
                  <SelectTrigger id="association_id">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Aluguel</SelectItem>
                    <SelectItem value="2">Assinatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 col-span-full">
                <Label htmlFor="association_notes">Observações da Vinculação</Label>
                <Input
                  id="association_notes"
                  name="association_notes"
                  placeholder="Informações adicionais sobre a vinculação"
                  value={assetData.association_notes || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
