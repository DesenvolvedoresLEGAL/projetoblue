import { useState, useEffect } from "react";
import { useAssets } from "@/context/useAssets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChipAsset, RouterAsset, Asset } from "@/types/asset";
import { Search, XCircle } from "lucide-react";
import { toast } from "@/utils/toast";

const Association = () => {
  const { assets, clients, associateAssetToClient, removeAssetFromClient, returnAssetsToStock, addHistoryEntry } = useAssets();
  const [searchAsset, setSearchAsset] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [filteredClients, setFilteredClients] = useState(clients);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  useEffect(() => {
    const debouncedFilterAssets = setTimeout(() => {
      if (searchAsset) {
        const results = assets.filter((asset) => {
          if (asset.type === "CHIP") {
            const chip = asset as ChipAsset;
            return (
              chip.iccid.toLowerCase().includes(searchAsset.toLowerCase()) ||
              chip.phoneNumber.toLowerCase().includes(searchAsset.toLowerCase())
            );
          } else {
            const router = asset as RouterAsset;
            return router.uniqueId.toLowerCase().includes(searchAsset.toLowerCase());
          }
        });
        setFilteredAssets(results);
      } else {
        setFilteredAssets([]);
      }
    }, 300);

    return () => clearTimeout(debouncedFilterAssets);
  }, [searchAsset, assets]);

  useEffect(() => {
    const debouncedFilterClients = setTimeout(() => {
      if (searchClient) {
        const results = clients.filter((client) =>
          client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
          client.document.toLowerCase().includes(searchClient.toLowerCase())
        );
        setFilteredClients(results);
      } else {
        setFilteredClients(clients);
      }
    }, 300);

    return () => clearTimeout(debouncedFilterClients);
  }, [searchClient, clients]);

  const handleAssetSelection = (assetId: string) => {
    const asset = assets.find((asset) => asset.id === assetId);
    setSelectedAsset(asset || null);
  };

  const handleClientSelection = (clientId: string) => {
    const client = clients.find((client) => client.id === clientId);
    setSelectedClient(client || null);
  };

  const handleAssociate = () => {
    if (selectedClient && selectedAsset) {
      associateAssetToClient(selectedAsset.id, selectedClient.id);
      // Use apenas 2 argumentos, conforme esperado pela função
      addHistoryEntry({
        type: "ASSOCIATION",
        description: `Ativo ${selectedAsset.id} associado ao cliente ${selectedClient.name}`
      });
      toast.success(`${selectedAsset.type === 'CHIP' ? 'Chip' : 'Roteador'} associado com sucesso ao cliente ${selectedClient.name}`);
      setSelectedAsset(null);
      setSelectedClient(null);
    }
  };

  const handleRemoveAsset = (assetId: string, clientId: string) => {
    removeAssetFromClient(assetId, clientId);
    addHistoryEntry({
      type: "REMOVAL",
      description: `Ativo ${assetId} removido do cliente ${clientId}`
    });
    toast.success("Ativo removido do cliente");
  };

  // Corrigir as variáveis e referências para return dialog
  const handleReturnAssets = () => {
    // Usar o selectedAsset singular, não o plural que não existe
    if (selectedAsset) {
      returnAssetsToStock([selectedAsset.id]);
      setSelectedAsset(null);
      // Removendo as chamadas para variáveis inexistentes
      toast.success("Ativo devolvido ao estoque");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Associação de Ativos a Clientes</h1>

      {/* Seleção de Ativo */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selecione um Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar por ICCID/ID do Ativo..."
              value={searchAsset}
              onChange={(e) => setSearchAsset(e.target.value)}
              className="pl-8"
            />
          </div>
          {filteredAssets.length > 0 && (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>ID / ICCID</TableHead>
                    <TableHead>Número / ID Único</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.type === "CHIP" ? "Chip" : "Roteador"}</TableCell>
                      <TableCell>
                        {asset.type === "CHIP" ? (asset as ChipAsset).iccid : (asset as RouterAsset).uniqueId}
                      </TableCell>
                      <TableCell>
                        {asset.type === "CHIP" ? (asset as ChipAsset).phoneNumber : (asset as RouterAsset).uniqueId}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleAssetSelection(asset.id)}>
                          Selecionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {selectedAsset && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold">Ativo Selecionado:</h3>
              <p>
                Tipo: {selectedAsset.type === "CHIP" ? "Chip" : "Roteador"}
              </p>
              <p>
                ID/ICCID:{" "}
                {selectedAsset.type === "CHIP"
                  ? (selectedAsset as ChipAsset).iccid
                  : (selectedAsset as RouterAsset).uniqueId}
              </p>
              <Button variant="destructive" size="sm" onClick={() => setSelectedAsset(null)}>
                Remover Seleção
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seleção de Cliente */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selecione um Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar por nome ou documento do Cliente..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.document}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleClientSelection(client.id)}>
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {selectedClient && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold">Cliente Selecionado:</h3>
              <p>Nome: {selectedClient.name}</p>
              <p>Documento: {selectedClient.document}</p>
              <Button variant="destructive" size="sm" onClick={() => setSelectedClient(null)}>
                Remover Seleção
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        <Button
          disabled={!selectedAsset || !selectedClient}
          onClick={handleAssociate}
        >
          Associar Ativo ao Cliente
        </Button>
        {selectedAsset && selectedAsset.clientId && (
          <Button
            variant="destructive"
            onClick={() => handleRemoveAsset(selectedAsset.id, selectedAsset.clientId)}
          >
            Remover Ativo do Cliente
          </Button>
        )}
        {selectedAsset && (
          <Button
            variant="secondary"
            onClick={handleReturnAssets}
          >
            Devolver Ativo ao Estoque
          </Button>
        )}
      </div>

      {/* Lista de Ativos Associados ao Cliente */}
      {selectedClient && selectedClient.assets && selectedClient.assets.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ativos Associados ao Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>ID / ICCID</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedClient.assets.map((assetId) => {
                  const asset = assets.find((asset) => asset.id === assetId);
                  if (!asset) return null;

                  return (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.type === "CHIP" ? "Chip" : "Roteador"}</TableCell>
                      <TableCell>
                        {asset.type === "CHIP" ? (asset as ChipAsset).iccid : (asset as RouterAsset).uniqueId}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAsset(asset.id, selectedClient.id)}
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Association;
