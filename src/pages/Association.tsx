import React, { useState, useEffect } from "react";
import { useAssets } from "@/context/useAssets";
import { Asset, Client, SubscriptionInfo, SubscriptionType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, 
  LinkIcon, 
  Unlink, 
  UserCheck, 
  Calendar,
  CalendarClock
} from "lucide-react";
import { format, addMonths, addYears } from "date-fns";

export default function Association() {
  const { 
    assets, 
    clients, 
    associateAssetToClient, 
    removeAssetFromClient, 
    getClientById, 
    returnAssetsToStock 
  } = useAssets();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  
  // Subscription states
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>("MENSAL");
  const [startDate, setStartDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [autoRenew, setAutoRenew] = useState<boolean>(false);
  
  // Calculate end date when subscription type changes
  useEffect(() => {
    const start = new Date(startDate);
    let end;
    
    if (subscriptionType === "MENSAL") {
      end = addMonths(start, 1);
    } else if (subscriptionType === "ANUAL") {
      end = addYears(start, 1);
    } else {
      // For custom, keep the existing end date or set to 1 month by default
      end = endDate ? new Date(endDate) : addMonths(start, 1);
    }
    
    setEndDate(format(end, "yyyy-MM-dd"));
  }, [subscriptionType, startDate]);
  
  // Update start date effect
  useEffect(() => {
    if (new Date(startDate) > new Date(endDate)) {
      // If start date is after end date, adjust end date
      const start = new Date(startDate);
      let end;
      
      if (subscriptionType === "MENSAL") {
        end = addMonths(start, 1);
      } else if (subscriptionType === "ANUAL") {
        end = addYears(start, 1);
      } else {
        end = addMonths(start, 1);
      }
      
      setEndDate(format(end, "yyyy-MM-dd"));
    }
  }, [startDate, endDate, subscriptionType]);
  
  // Filter assets to only show available ones
  useEffect(() => {
    setAvailableAssets(assets.filter(asset => asset.status === "DISPONÍVEL"));
  }, [assets]);
  
  // Filter assets and clients based on search term
  const filteredAssets = availableAssets.filter(asset => {
    const searchFields = [
      asset.id,
      asset.type,
      asset.type === "CHIP" 
        ? `${(asset as any).iccid} ${(asset as any).phoneNumber} ${(asset as any).carrier}`
        : `${(asset as any).uniqueId} ${(asset as any).brand} ${(asset as any).model}`
    ];
    
    return searchFields.some(field => 
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.includes(searchTerm)
  );
  
  // Handle asset association
  const handleAssociateAsset = () => {
    if (selectedAsset && selectedClient) {
      const subscription: SubscriptionInfo = {
        type: subscriptionType,
        startDate,
        endDate,
        event: eventName || undefined,
        autoRenew
      };
      
      associateAssetToClient(selectedAsset.id, selectedClient.id, subscription);
      
      // Reset selections after association
      setSelectedAsset(null);
      setSelectedClient(null);
      setSubscriptionType("MENSAL");
      setEventName("");
      setAutoRenew(false);
    }
  };
  
  // Display associated assets for a specific client
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);
  const viewingClient = viewingClientId ? getClientById(viewingClientId) : null;
  const clientAssets = viewingClient ? assets.filter(asset => 
    viewingClient.assets.includes(asset.id)
  ) : [];
  
  const handleRemoveAssetFromClient = (assetId: string, clientId: string) => {
    removeAssetFromClient(assetId, clientId);
  };

  const formatDateToDisplay = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const getConnectionTypeDisplay = (type: string) => {
    switch(type) {
      case "MENSAL": return "Assinatura mensal";
      case "ANUAL": return "Assinatura anual";
      case "ALUGUEL": return "Aluguel";
      default: return type;
    }
  };

  // Fix the returnAssetsToStock call by removing the third argument
  const handleConfirmReturn = () => {
    returnAssetsToStock(selectedAssets);
    setSelectedAssets([]);
    setIsReturnDialogOpen(false);
    toast.success(`${selectedAssets.length} ativos retornados ao estoque com sucesso.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vincular Ativos</h1>
        <p className="text-gray-500">Associe ativos a clientes</p>
      </div>
      
      {viewingClientId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-telecom-600" />
              <h2 className="text-xl font-medium">
                Ativos do Cliente: {viewingClient?.name}
              </h2>
            </div>
            <Button variant="outline" onClick={() => setViewingClientId(null)}>
              Voltar
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assinatura</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Este cliente não possui ativos vinculados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.id.substring(0, 8)}</TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>
                          {asset.type === "CHIP" ? 
                            `${(asset as any).carrier} - ${(asset as any).phoneNumber}` : 
                            `${(asset as any).brand} ${(asset as any).model}`
                          }
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${asset.status === "ALUGADO" ? "bg-blue-100 text-blue-800" : 
                             asset.status === "ASSINATURA" ? "bg-purple-100 text-purple-800" : 
                             "bg-gray-100 text-gray-800"}`}>
                            {asset.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {asset.subscription ? (
                            <div className="text-xs">
                              <div className="font-medium">{asset.subscription.type}</div>
                              <div className="text-gray-500">
                                {formatDateToDisplay(asset.subscription.startDate)} - {formatDateToDisplay(asset.subscription.endDate)}
                              </div>
                              {asset.subscription.event && (
                                <div className="text-gray-500">Evento: {asset.subscription.event}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Não definida</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAssetFromClient(asset.id, viewingClientId)}
                          >
                            <Unlink className="h-4 w-4 mr-2" /> Desvincular
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Asset Selection Card */}
          <Card className={`${selectedAsset ? "ring-2 ring-blue-300" : ""}`}>
            <CardHeader>
              <CardTitle>1. Selecione um Ativo</CardTitle>
              <CardDescription>
                Escolha um ativo disponível para vincular
              </CardDescription>
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar ativos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead className="text-right">Selecionar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                          Nenhum ativo disponível encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => (
                        <TableRow 
                          key={asset.id}
                          className={selectedAsset?.id === asset.id ? "bg-blue-50" : ""}
                        >
                          <TableCell>{asset.type}</TableCell>
                          <TableCell>
                            {asset.type === "CHIP" ? 
                              `${(asset as any).carrier} - ${(asset as any).phoneNumber}` : 
                              `${(asset as any).brand} ${(asset as any).model}`
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={selectedAsset?.id === asset.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedAsset(asset)}
                            >
                              Selecionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Client Selection Card */}
          <Card className={`${selectedClient ? "ring-2 ring-blue-300" : ""}`}>
            <CardHeader>
              <CardTitle>2. Selecione um Cliente</CardTitle>
              <CardDescription>
                Escolha um cliente para vincular o ativo
              </CardDescription>
              <div className="mt-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar clientes..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                          Nenhum cliente encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((client) => (
                        <TableRow 
                          key={client.id}
                          className={selectedClient?.id === client.id ? "bg-blue-50" : ""}
                        >
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>
                            {client.documentType}: {client.document}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingClientId(client.id)}
                              >
                                Ver Ativos ({client.assets.length})
                              </Button>
                              <Button
                                variant={selectedClient?.id === client.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedClient(client)}
                              >
                                Selecionar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Association Action with Subscription Options */}
      {selectedAsset && selectedClient && !viewingClientId && (
        <div className="mt-8 flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">Confirmar Vinculação</h3>
            <p className="text-gray-500">
              Você está prestes a vincular o ativo ao cliente com as seguintes condições:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <Label className="text-xs text-gray-500">Ativo</Label>
              <p className="font-medium">
                {selectedAsset.type === "CHIP" ? 
                  `CHIP: ${(selectedAsset as any).carrier} - ${(selectedAsset as any).phoneNumber}` : 
                  `ROTEADOR: ${(selectedAsset as any).brand} ${(selectedAsset as any).model}`
                }
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <Label className="text-xs text-gray-500">Cliente</Label>
              <p className="font-medium">{selectedClient.name}</p>
              <p className="text-sm text-gray-500">
                {selectedClient.documentType}: {selectedClient.document}
              </p>
            </div>
          </div>
          
          {/* Subscription Options */}
          <div className="w-full max-w-2xl bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h4 className="font-medium mb-3 flex items-center">
              <CalendarClock className="h-4 w-4 mr-2" />
              Opções de Vinculação
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subscriptionType">Tipo de Vinculação</Label>
                <Select 
                  value={subscriptionType} 
                  onValueChange={(value) => setSubscriptionType(value as SubscriptionType)}
                >
                  <SelectTrigger id="subscriptionType">
                    <SelectValue placeholder="Selecione o tipo de vinculação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MENSAL">Assinatura mensal</SelectItem>
                    <SelectItem value="ANUAL">Assinatura anual</SelectItem>
                    <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="event">Evento (opcional)</Label>
                <Input
                  id="event"
                  placeholder="Ex: Conferência Anual"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="autoRenew" className="text-sm font-normal">
                    Renovar automaticamente ao expirar
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAsset(null);
                setSelectedClient(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAssociateAsset}>
              <LinkIcon className="h-4 w-4 mr-2" /> Confirmar Vinculação
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
