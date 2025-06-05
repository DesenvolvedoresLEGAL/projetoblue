
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Plus,
  PlugZap,
  Check,
  MessageCircle,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Smartphone,
  Globe,
  ClipboardCheck,
  Lock,
  Headphones
} from "lucide-react";

const TicketsIntegrations: React.FC = () => {
  // Mock data for integrations
  const installedIntegrations = [
    {
      id: "1",
      name: "WhatsApp Business",
      description: "Conecte-se com clientes via WhatsApp",
      category: "chat",
      icon: <MessageCircle className="h-10 w-10 text-green-500" />,
      status: "active",
      connectedAccounts: 2
    },
    {
      id: "2",
      name: "Email de Suporte",
      description: "Gerencie emails de suporte direto no sistema",
      category: "email",
      icon: <Mail className="h-10 w-10 text-blue-500" />,
      status: "active",
      connectedAccounts: 3
    },
    {
      id: "3",
      name: "Formulário Web",
      description: "Formulário de contato integrado ao site",
      category: "web",
      icon: <Globe className="h-10 w-10 text-purple-500" />,
      status: "active",
      connectedAccounts: 1
    }
  ];

  const popularIntegrations = [
    {
      id: "4",
      name: "SMS Broadcast",
      description: "Envio em massa de SMS para clientes",
      category: "messaging",
      icon: <Smartphone className="h-10 w-10 text-gray-600" />,
      usageCount: "2,345+"
    },
    {
      id: "5",
      name: "Facebook Messenger",
      description: "Integração com chat do Facebook",
      category: "chat",
      icon: <Facebook className="h-10 w-10 text-blue-600" />,
      usageCount: "5,672+"
    },
    {
      id: "6",
      name: "Twitter Direct",
      description: "Mensagens diretas do Twitter",
      category: "social",
      icon: <Twitter className="h-10 w-10 text-blue-400" />,
      usageCount: "1,892+"
    },
    {
      id: "7",
      name: "Instagram DM",
      description: "Gerenciamento de mensagens do Instagram",
      category: "social",
      icon: <Instagram className="h-10 w-10 text-pink-500" />,
      usageCount: "3,421+"
    },
    {
      id: "8",
      name: "Call Center",
      description: "Integração com sistemas de telefonia",
      category: "call",
      icon: <Phone className="h-10 w-10 text-red-500" />,
      usageCount: "1,245+"
    }
  ];

  const categories = [
    { id: "all", name: "Todas", count: 73 },
    { id: "chat", name: "Chat & Mensagens", count: 18 },
    { id: "email", name: "Email", count: 12 },
    { id: "call", name: "Telefonia", count: 8 },
    { id: "social", name: "Redes Sociais", count: 15 },
    { id: "web", name: "Web", count: 10 },
    { id: "surveys", name: "Pesquisas & Feedback", count: 8 },
    { id: "crm", name: "CRM", count: 14 },
    { id: "analytics", name: "Analytics", count: 7 }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Integrações</h1>
          <p className="text-muted-foreground">
            Conecte canais de atendimento e ferramentas externas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Integração
        </Button>
      </div>

      {/* Search and Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar integrações por nome, categoria ou funcionalidade..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Categorias</span>
                <Badge variant="outline">{categories.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Installed Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Integrações Instaladas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {installedIntegrations.map((integration) => (
              <div 
                key={integration.id}
                className="border rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-full">
                    {integration.icon}
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {integration.status === "active" ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                
                <h3 className="font-semibold mb-2">{integration.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <Badge variant="secondary">{integration.category}</Badge>
                  <span className="text-muted-foreground">
                    {integration.connectedAccounts} contas conectadas
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Configurar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Desativar
                  </Button>
                </div>
              </div>
            ))}

            <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
              <PlugZap className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="font-semibold text-center mb-2">Adicionar Nova Integração</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Conecte mais canais de atendimento
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularIntegrations.map((integration) => (
              <div 
                key={integration.id}
                className="border rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-gray-50 rounded-full mb-3">
                    {integration.icon}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{integration.description}</p>
                  <div className="flex items-center justify-between w-full">
                    <Badge variant="outline" className="text-xs">
                      {integration.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {integration.usageCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat & Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm">WhatsApp Business</span>
                </div>
                <Badge variant="secondary" className="text-xs">Instalado</Badge>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Facebook Messenger</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Instalar
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-sm">Live Chat</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Instalar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              CRM & Automação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <ClipboardCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Salesforce</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Instalar
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <ClipboardCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">Hubspot</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Instalar
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <ClipboardCheck className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm">Pipedrive</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Instalar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Telefonia & VoIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Phone className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm">Twilio</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Instalar
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Phone className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm">VoIP Connect</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Instalar
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Phone className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm">Call Tracker</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  Instalar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            API e Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Documentação da API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Nossa API RESTful completa permite integrar o sistema de tickets com suas aplicações existentes.
                Consulte nossa documentação técnica para começar.
              </p>
              <Button variant="outline">
                Ver Documentação
              </Button>
            </div>
            <div>
              <h3 className="font-medium mb-3">SDKs e Ferramentas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bibliotecas e ferramentas para facilitar a integração com diferentes linguagens e plataformas:
                JavaScript, Python, PHP, Java e mais.
              </p>
              <Button variant="outline">
                Acessar SDKs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsIntegrations;
