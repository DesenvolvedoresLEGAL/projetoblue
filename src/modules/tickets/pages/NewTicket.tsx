
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, X, AlertCircle, Clock, User, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NewTicket = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: '',
    category: '',
    customer: '',
    assignee: '',
    tags: [] as string[],
    attachments: [] as File[]
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Conectividade',
    'Equipamentos',
    'Configuração',
    'Suporte Técnico',
    'Instalação',
    'Manutenção',
    'Atualização',
    'Consulta'
  ];

  const customers = [
    'TechCorp Ltda',
    'Inovações S.A.',
    'StartupXYZ',
    'GlobalTech Inc',
    'DigitalSoft',
    'SecureNet',
    'FastGrowth Inc',
    'QuickBiz'
  ];

  const agents = [
    'João Silva',
    'Maria Santos',
    'Pedro Costa',
    'Ana Lima',
    'Carlos Oliveira',
    'Fernanda Rocha',
    'Roberto Dias',
    'Juliana Mendes'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleRemoveAttachment = (fileToRemove: File) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(file => file !== fileToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.description || !formData.priority || !formData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Simular criação do ticket
    const ticketId = `T-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    toast({
      title: "Ticket criado com sucesso!",
      description: `Ticket ${ticketId} foi criado e será processado em breve.`,
    });

    // Reset form
    setFormData({
      subject: '',
      description: '',
      priority: '',
      category: '',
      customer: '',
      assignee: '',
      tags: [],
      attachments: []
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'text-red-600 bg-red-50 border-red-200';
      case 'Média': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Baixa': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Plus}
        title="Novo Ticket"
        description="Crie um novo ticket de suporte para acompanhamento"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas">Informações do Ticket</CardTitle>
              <CardDescription>Preencha os detalhes do novo ticket de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input
                      id="subject"
                      placeholder="Digite o assunto do ticket"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer">Cliente *</Label>
                    <Select value={formData.customer} onValueChange={(value) => handleInputChange('customer', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade *</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignee">Responsável</Label>
                    <Select value={formData.assignee} onValueChange={(value) => handleInputChange('assignee', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Atribuir a alguém" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent} value={agent}>
                            {agent}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente o problema ou solicitação..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Adicionar tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Tag className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => handleRemoveTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Anexos</Label>
                  <div className="border-2 border-dashed border-[#4D2BFB]/20 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center gap-2 cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-[#4D2BFB]" />
                      <span className="text-sm text-muted-foreground">
                        Clique para adicionar arquivos ou arraste e solte
                      </span>
                    </label>
                  </div>
                  
                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAttachment(file)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-[#4D2BFB] hover:bg-[#020CBC] flex-1 md:flex-none"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Ticket
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 md:flex-none">
                    Salvar Rascunho
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Preview Card */}
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.subject && (
                <div>
                  <Label className="text-xs text-muted-foreground">ASSUNTO</Label>
                  <p className="font-medium">{formData.subject}</p>
                </div>
              )}
              
              {formData.priority && (
                <div>
                  <Label className="text-xs text-muted-foreground">PRIORIDADE</Label>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-1 ${getPriorityColor(formData.priority)}`}>
                    {formData.priority}
                  </div>
                </div>
              )}
              
              {formData.category && (
                <div>
                  <Label className="text-xs text-muted-foreground">CATEGORIA</Label>
                  <p className="text-sm">{formData.category}</p>
                </div>
              )}
              
              {formData.customer && (
                <div>
                  <Label className="text-xs text-muted-foreground">CLIENTE</Label>
                  <p className="text-sm">{formData.customer}</p>
                </div>
              )}
              
              {formData.assignee && (
                <div>
                  <Label className="text-xs text-muted-foreground">RESPONSÁVEL</Label>
                  <p className="text-sm">{formData.assignee}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Dicas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-[#4D2BFB] mt-0.5 flex-shrink-0" />
                <p>Tickets de alta prioridade são respondidos em até 2 horas</p>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-[#4D2BFB] mt-0.5 flex-shrink-0" />
                <p>Atribuir um responsável acelera o processamento</p>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-[#4D2BFB] mt-0.5 flex-shrink-0" />
                <p>Use tags para facilitar a busca e organização</p>
              </div>
              <div className="flex items-start gap-2">
                <Upload className="h-4 w-4 text-[#4D2BFB] mt-0.5 flex-shrink-0" />
                <p>Anexe screenshots ou logs para agilizar a resolução</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewTicket;
