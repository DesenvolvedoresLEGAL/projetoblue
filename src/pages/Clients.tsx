
import { useState } from "react";
import { useAssets } from "@/context/useAssets";
import { Client } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Package, Flag } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/utils/toast";
import ClientDetailsDialog from "@/components/clients/ClientDetailsDialog";

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient, getClientById } = useAssets();
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const [formData, setFormData] = useState<Omit<Client, "id" | "assets">>({
    name: "",
    document: "",
    documentType: "CPF",
    contact: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddClient = () => {
    if (!formData.name || !formData.contact) {
      toast.error("Por favor, preencha o nome e contato");
      return;
    }

    addClient(formData);
    resetForm();
    setIsAddingClient(false);
  };

  const handleUpdateClient = () => {
    if (!editingClientId) return;
    
    if (!formData.name || !formData.contact) {
      toast.error("Por favor, preencha o nome e contato");
      return;
    }

    updateClient(editingClientId, formData);
    resetForm();
    setEditingClientId(null);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteClient(id);
    }
  };

  const startEditingClient = (id: string) => {
    const client = getClientById(id);
    if (client) {
      setFormData({
        name: client.name,
        document: client.document,
        documentType: client.documentType,
        contact: client.contact,
        email: client.email,
        address: client.address,
        city: client.city,
        state: client.state,
        zipCode: client.zipCode,
      });
      setEditingClientId(id);
      setIsAddingClient(true);
    }
  };

  const viewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      document: "",
      documentType: "CPF",
      contact: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setEditingClientId(null);
    setIsAddingClient(false);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.includes(searchTerm)
  );

  const isMissingCNPJ = (client: Client) => {
    return client.documentType === "CNPJ" && (!client.document || client.document.trim() === "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        {!isAddingClient && (
          <Button onClick={() => setIsAddingClient(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Cliente
          </Button>
        )}
      </div>

      {isAddingClient ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">
            {editingClientId ? "Editar Cliente" : "Adicionar Novo Cliente"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <select
                id="documentType"
                name="documentType"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.documentType}
                onChange={handleInputChange}
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">Documento</Label>
              <Input
                id="document"
                name="document"
                value={formData.document}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contato *</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              onClick={editingClientId ? handleUpdateClient : handleAddClient}
            >
              {editingClientId ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Input
              placeholder="Buscar por nome ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Ativos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow 
                      key={client.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => viewClientDetails(client)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isMissingCNPJ(client) && (
                            <Flag className="h-4 w-4 text-yellow-500" />
                          )}
                          {client.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.documentType}: {client.document || "Não informado"}
                      </TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="mr-1 h-4 w-4 text-gray-500" /> 
                          {client.assets.length}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEditingClient(client.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      
      <ClientDetailsDialog 
        client={selectedClient}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />
    </div>
  );
}
