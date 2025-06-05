
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  X,
  Upload,
  Lightbulb,
  Send,
  Save,
  User,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NewTicket: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requester: "",
    requesterEmail: "",
    subject: "",
    description: "",
    priority: "",
    type: "",
    assignee: "",
    group: "",
    tags: [] as string[],
    customFields: {}
  });

  const [newTag, setNewTag] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Verificar configurações de rede",
    "Reinicializar o equipamento",
    "Atualizar firmware do dispositivo"
  ]);

  // Mock data - replace with actual API calls
  const agents = [
    { id: "1", name: "Maria Santos", email: "maria@empresa.com" },
    { id: "2", name: "Pedro Lima", email: "pedro@empresa.com" },
    { id: "3", name: "Lucia Fernandes", email: "lucia@empresa.com" }
  ];

  const groups = [
    { id: "1", name: "Suporte Técnico" },
    { id: "2", name: "Suporte Comercial" },
    { id: "3", name: "Billing" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (isDraft = false) => {
    // Implement ticket creation logic
    console.log("Creating ticket:", { ...formData, isDraft });
    navigate('/tickets/inbox');
  };

  const generateAiSuggestion = () => {
    // Mock AI suggestion based on subject/description
    if (formData.subject.toLowerCase().includes('wifi') || formData.description.toLowerCase().includes('wifi')) {
      setAiSuggestions([
        "Verificar configurações do roteador",
        "Testar conexão em diferentes dispositivos",
        "Verificar interferências na rede",
        "Atualizar drivers de rede"
      ]);
    } else if (formData.subject.toLowerCase().includes('chip') || formData.description.toLowerCase().includes('chip')) {
      setAiSuggestions([
        "Verificar sinal da operadora",
        "Testar chip em outro dispositivo",
        "Verificar configurações APN",
        "Solicitar troca do chip"
      ]);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Novo Ticket</h1>
          <p className="text-muted-foreground">
            Registre um novo ticket de suporte
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit(true)}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSubmit(false)}>
            <Send className="h-4 w-4 mr-2" />
            Enviar Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requester Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requester">Nome do Solicitante *</Label>
                  <Input
                    id="requester"
                    value={formData.requester}
                    onChange={(e) => handleInputChange("requester", e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="requesterEmail">Email *</Label>
                  <Input
                    id="requesterEmail"
                    type="email"
                    value={formData.requesterEmail}
                    onChange={(e) => handleInputChange("requesterEmail", e.target.value)}
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  onBlur={generateAiSuggestion}
                  placeholder="Descreva brevemente o problema"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  onBlur={generateAiSuggestion}
                  placeholder="Descreva detalhadamente o problema ou solicitação"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridade *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">Incidente</SelectItem>
                      <SelectItem value="problem">Problema</SelectItem>
                      <SelectItem value="question">Pergunta</SelectItem>
                      <SelectItem value="task">Tarefa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Adicionar tag"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label>Anexos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 10MB por arquivo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Atribuição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="assignee">Responsável</Label>
                <Select value={formData.assignee} onValueChange={(value) => handleInputChange("assignee", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar agente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não atribuído</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="group">Grupo</Label>
                <Select value={formData.group} onValueChange={(value) => handleInputChange("group", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Sugestões IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div 
                      key={index}
                      className="p-2 text-sm bg-yellow-50 border border-yellow-200 rounded cursor-pointer hover:bg-yellow-100"
                      onClick={() => {
                        const currentDesc = formData.description;
                        const newDesc = currentDesc ? `${currentDesc}\n\n• ${suggestion}` : `• ${suggestion}`;
                        handleInputChange("description", newDesc);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                Dicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Seja específico no assunto</p>
                <p>• Inclua detalhes relevantes na descrição</p>
                <p>• Anexe logs ou capturas de tela quando possível</p>
                <p>• Use tags para facilitar a busca</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewTicket;
