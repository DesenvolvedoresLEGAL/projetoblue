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
import { toast } from "sonner";
import TicketForm from '../components/TicketForm';

const NewTicket = () => {
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
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Simular criação do ticket
    const ticketId = `T-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    toast.success(`Ticket ${ticketId} foi criado e será processado em breve.`);

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
              <TicketForm />
        </div>

        <div className="space-y-6">
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
                <Tag className="h-4 w-4 text-[#4D2BFB] mt-0.5 flex-shrink-0" />
                <p>Use tags para facilitar a busca e organização</p>
              </div>
              <div className="flex items-start gap-2">
                <Upload className="h-4 w-4 text-[#4D2BFB] mt-0.5 flex-shrink-0" />
                <p>Anexe screenshots para agilizar a resolução</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewTicket;
