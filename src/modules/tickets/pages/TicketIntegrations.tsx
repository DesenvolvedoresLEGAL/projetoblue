
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Puzzle, Check, X, ArrowUpRight, Webhook, Link2, Slack, Mail, Loader2,
  PlusCircle, Globe, MessageSquare, BellRing, FileCode, RefreshCcw, Settings2
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

const TicketIntegrations = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock integration data
  const availableIntegrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Integre tickets com canais e mensagens diretas no Slack',
      icon: Slack,
      category: 'messaging',
      status: 'available'
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Configure notificações por email e crie tickets via email',
      icon: Mail,
      category: 'messaging',
      status: 'connected'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Conecte com mais de 3000 aplicativos e automatize fluxos',
      icon: Webhook,
      category: 'automation',
      status: 'available'
    },
    {
      id: 'webhook',
      name: 'Webhooks',
      description: 'Receba e envie atualizações de tickets via webhooks',
      icon: Globe,
      category: 'api',
      status: 'connected'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Integre tickets com equipes e canais do MS Teams',
      icon: MessageSquare,
      category: 'messaging',
      status: 'available'
    },
    {
      id: 'pagerduty',
      name: 'PagerDuty',
      description: 'Gerencie incidentes e escalações de tickets',
      icon: BellRing,
      category: 'monitoring',
      status: 'available'
    },
    {
      id: 'api',
      name: 'REST API',
      description: 'Acesso à API para integração personalizada',
      icon: FileCode,
      category: 'api',
      status: 'connected'
    }
  ];

  const activeIntegrations = [
    {
      id: 'email-1',
      name: 'Email - Notificações',
      description: 'Envia notificações de novos tickets e atualizações',
      type: 'Email',
      lastSync: '2024-01-15 14:30',
      status: 'active'
    },
    {
      id: 'webhook-1',
      name: 'Webhook - Atualizações',
      description: 'Envia dados para sistema de monitoramento externo',
      type: 'Webhook',
      lastSync: '2024-01-15 13:45',
      status: 'active'
    },
    {
      id: 'api-1',
      name: 'API - Importação de Clientes',
      description: 'Sincroniza dados de clientes do CRM',
      type: 'REST API',
      lastSync: '2024-01-14 09:20',
      status: 'active'
    }
  ];

  const handleTriggerWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL de webhook válida",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulating the API call
      setTimeout(() => {
        toast({
          title: "Webhook enviado com sucesso",
          description: "O webhook foi acionado com sucesso",
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao acionar o webhook",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Puzzle}
        title="Integrações"
        description="Conecte o sistema de tickets com outras ferramentas e serviços"
      >
        <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </StandardPageHeader>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#020CBC] font-neue-haas">Integrações Ativas</CardTitle>
                  <CardDescription>Serviços e aplicativos atualmente conectados</CardDescription>
                </div>
                <Button variant="outline">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Sincronizar Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeIntegrations.map(integration => (
                  <Card key={integration.id} className="border-l-4 border-l-[#4D2BFB]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-[#020CBC]">{integration.name}</h3>
                            <Badge variant="secondary">
                              {integration.type}
                            </Badge>
                            <Badge variant="success" className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Última sincronização: {integration.lastSync}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Settings2 className="h-4 w-4 mr-1" />
                            Configurar
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            Sincronizar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {activeIntegrations.length === 0 && (
                <div className="text-center py-8">
                  <Puzzle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Nenhuma integração ativa
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não configurou nenhuma integração.
                  </p>
                  <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar Integração
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas">Integrações Disponíveis</CardTitle>
              <CardDescription>Conecte o sistema com estes serviços externos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableIntegrations.map(integration => {
                  const Icon = integration.icon;
                  const isConnected = integration.status === 'connected';
                  
                  return (
                    <Card key={integration.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 rounded-md bg-[#4D2BFB]/10">
                            <Icon className="h-6 w-6 text-[#4D2BFB]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#020CBC]">{integration.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {integration.category.capitalize()}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 h-12 line-clamp-2">
                          {integration.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch checked={isConnected} />
                            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {isConnected ? 'Conectado' : 'Desconectado'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#4D2BFB]"
                          >
                            {isConnected ? 'Configurar' : 'Conectar'}
                            <ArrowUpRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas">Configuração de Webhooks</CardTitle>
                  <CardDescription>Configure e teste webhooks para integração com serviços externos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Webhooks de Entrada</h3>
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                          <Label>URL do Webhook</Label>
                          <div className="flex gap-2">
                            <Input
                              value="https://app.seudominio.com/api/webhooks/tickets/inbound"
                              readOnly
                              className="flex-1 bg-gray-50"
                            />
                            <Button variant="outline">
                              Copiar
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Use esta URL para receber notificações de sistemas externos
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-green-100 text-green-800 rounded-full">
                              <Check className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-medium">Webhook Ativo</h4>
                              <p className="text-xs text-muted-foreground">
                                Último evento: 15 minutos atrás
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Ver Logs
                            </Button>
                            <Button variant="destructive" size="sm">
                              Revogar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Webhooks de Saída</h3>
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                          <Label htmlFor="webhook-url">URL de Destino</Label>
                          <div className="flex gap-2">
                            <Input
                              id="webhook-url"
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              placeholder="https://"
                              className="flex-1"
                            />
                            <Button
                              onClick={handleTriggerWebhook}
                              disabled={isLoading || !webhookUrl}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  Testar Webhook
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Eventos para Notificar</Label>
                            <Button variant="ghost" size="sm">
                              Marcar Todos
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch id="event-ticket-created" defaultChecked />
                              <Label htmlFor="event-ticket-created">Ticket Criado</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="event-ticket-updated" defaultChecked />
                              <Label htmlFor="event-ticket-updated">Ticket Atualizado</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="event-ticket-assigned" defaultChecked />
                              <Label htmlFor="event-ticket-assigned">Ticket Atribuído</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="event-ticket-closed" />
                              <Label htmlFor="event-ticket-closed">Ticket Fechado</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="event-comment-added" />
                              <Label htmlFor="event-comment-added">Comentário Adicionado</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="event-status-changed" />
                              <Label htmlFor="event-status-changed">Status Alterado</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Guia Rápido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">O que são Webhooks?</h3>
                    <p className="text-sm text-muted-foreground">
                      Webhooks permitem que sistemas se comuniquem automaticamente quando 
                      eventos específicos ocorrem, facilitando a integração entre aplicações.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Como Utilizar</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                      <li>Configure a URL de destino que receberá as notificações</li>
                      <li>Selecione quais eventos devem disparar notificações</li>
                      <li>Use a URL de entrada para receber eventos de outros sistemas</li>
                      <li>Verifique os logs para monitorar o tráfego de webhooks</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Formato de Payload</h3>
                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                      {`{
  "event": "ticket.created",
  "ticket_id": "T-2024-001",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "subject": "...",
    "status": "open",
    "priority": "high"
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Documentação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-[#4D2BFB]" />
                      <span className="text-sm">Guia de Webhooks</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-[#4D2BFB]" />
                      <span className="text-sm">Documentação da API</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#4D2BFB]" />
                      <span className="text-sm">Fórum de Desenvolvedores</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketIntegrations;
