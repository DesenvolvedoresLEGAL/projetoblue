
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Bot, MessageSquare, Zap, Lightbulb, History, Copy, Send, RefreshCcw, Download,
  FileText, Settings, Clock, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AgentCopilot = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou o Copiloto do Agente de Suporte. Como posso ajudar você hoje?'
    }
  ]);

  // Mock data
  const sugestedPrompts = [
    "Como resolver problemas de conectividade WiFi?",
    "Gere uma resposta para um cliente com problemas de autenticação",
    "Recomende procedimentos para atualização de firmware",
    "Explique as diferenças entre os modelos de roteadores",
    "Crie um relatório de diagnóstico para problemas de rede"
  ];

  const previousConversations = [
    {
      id: 1,
      title: "Diagnóstico de conectividade",
      date: "2024-01-15 14:30",
      messages: 12
    },
    {
      id: 2,
      title: "Explicação sobre configuração de rede",
      date: "2024-01-14 10:15",
      messages: 8
    },
    {
      id: 3,
      title: "Assistência em resolução de problemas",
      date: "2024-01-10 09:45",
      messages: 15
    }
  ];

  const knowledgeTopics = [
    {
      title: "Conectividade WiFi",
      count: 18,
      topics: ["Configuração", "Segurança", "Alcance", "Interferência"]
    },
    {
      title: "Equipamentos",
      count: 12, 
      topics: ["Roteadores", "Access Points", "Switches", "Modems"]
    },
    {
      title: "Procedimentos",
      count: 15,
      topics: ["Instalação", "Manutenção", "Atualização", "Diagnóstico"]
    },
    {
      title: "Relacionamento",
      count: 10,
      topics: ["Comunicação", "Atendimento", "Suporte", "Escrita"]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Add user message to conversation
    const userMessage = { role: 'user', content: prompt };
    setConversation(prev => [...prev, userMessage]);
    
    // Reset prompt and simulate loading
    setPrompt('');
    setLoading(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      // Generate a mock AI response based on the prompt
      let aiResponse = "";
      
      if (prompt.toLowerCase().includes('wifi') || prompt.toLowerCase().includes('conectividade')) {
        aiResponse = "Para resolver problemas de conectividade WiFi, recomendo seguir estas etapas:\n\n" +
          "1. Verifique se o modem/roteador está ligado e com as luzes indicadoras normais.\n" +
          "2. Tente reiniciar o equipamento (desligar, aguardar 30 segundos e religar).\n" +
          "3. Verifique se o problema ocorre em todos os dispositivos ou apenas em um específico.\n" +
          "4. Se for em apenas um dispositivo, tente esquecer a rede e conectar novamente.\n" +
          "5. Verifique se há interferência de outros equipamentos ou redes próximas.\n" +
          "6. Como último recurso, faça um reset de fábrica no equipamento seguindo o manual do fabricante.\n\n" +
          "Se o problema persistir após essas etapas, será necessário uma análise mais detalhada. Posso te ajudar com isso?";
      } else if (prompt.toLowerCase().includes('firmware') || prompt.toLowerCase().includes('atualização')) {
        aiResponse = "Para atualização de firmware em equipamentos, siga estas recomendações:\n\n" +
          "1. Antes de iniciar, faça um backup das configurações atuais.\n" +
          "2. Verifique o modelo exato do equipamento e baixe o firmware correto do site oficial do fabricante.\n" +
          "3. Conecte o equipamento via cabo para evitar desconexões durante o processo.\n" +
          "4. Siga as instruções específicas do manual para o modelo em questão.\n" +
          "5. Não interrompa o processo de atualização para evitar danos ao equipamento.\n" +
          "6. Após a atualização, verifique se todas as funcionalidades estão operando corretamente.\n\n" +
          "Lembre-se que cada fabricante pode ter procedimentos específicos, sempre consulte a documentação oficial.";
      } else if (prompt.toLowerCase().includes('diagnóstico') || prompt.toLowerCase().includes('relatorio')) {
        aiResponse = "Para criar um relatório de diagnóstico para problemas de rede, inclua:\n\n" +
          "**1. Informações do Cliente**\n" +
          "- Nome da empresa/cliente\n" +
          "- Endereço de instalação\n" +
          "- Contato técnico responsável\n\n" +
          "**2. Detalhes da Infraestrutura**\n" +
          "- Equipamentos instalados (modelos e versões)\n" +
          "- Topologia da rede\n" +
          "- Configurações atuais\n\n" +
          "**3. Problemas Identificados**\n" +
          "- Descrição detalhada dos sintomas\n" +
          "- Frequência e duração dos problemas\n" +
          "- Logs de erros relevantes\n\n" +
          "**4. Testes Realizados**\n" +
          "- Metodologia utilizada\n" +
          "- Resultados obtidos\n" +
          "- Capturas de tela/logs\n\n" +
          "**5. Diagnóstico**\n" +
          "- Causa raiz identificada\n" +
          "- Fatores contribuintes\n\n" +
          "**6. Recomendações**\n" +
          "- Ações imediatas\n" +
          "- Soluções de médio/longo prazo\n" +
          "- Melhorias preventivas";
      } else {
        aiResponse = "Obrigado pela sua consulta. Para melhor atendê-lo, poderia fornecer mais detalhes sobre o problema ou questão específica? Isso me ajudará a fornecer informações mais precisas e relevantes para o seu caso. Estou à disposição para ajudar com configurações, diagnósticos, procedimentos técnicos ou qualquer outra necessidade relacionada ao suporte.";
      }
      
      // Add AI response to conversation
      const assistantMessage = { role: 'assistant', content: aiResponse };
      setConversation(prev => [...prev, assistantMessage]);
      
      setLoading(false);
    }, 1500);
  };

  const handleSuggestedPrompt = (text: string) => {
    setPrompt(text);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado para a área de transferência",
      description: "O texto foi copiado com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Bot}
        title="Copiloto do Agente (IA)"
        description="Assistente inteligente para suporte aos agentes"
      >
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </StandardPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chat Card */}
          <Card className="border-[#4D2BFB]/20 h-[600px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-[#4D2BFB]/10">
                    <Bot className="h-5 w-5 text-[#4D2BFB]" />
                  </div>
                  <CardTitle className="text-[#020CBC] font-neue-haas">Copiloto IA</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={() => setConversation([conversation[0]])}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Nova Conversa
                </Button>
              </div>
              <CardDescription>
                Assistente baseado em IA para ajudar no suporte técnico
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow overflow-auto pb-4 space-y-4">
                {conversation.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-[#4D2BFB] text-white'
                          : 'bg-[#4D2BFB]/10 text-gray-700'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-8 text-xs opacity-70 hover:opacity-100"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 rounded-lg bg-[#4D2BFB]/10 text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="h-2 w-2 bg-[#4D2BFB] rounded-full"></div>
                          <div className="h-2 w-2 bg-[#4D2BFB] rounded-full"></div>
                          <div className="h-2 w-2 bg-[#4D2BFB] rounded-full"></div>
                        </div>
                        <span className="text-sm">Gerando resposta...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-grow">
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Digite sua pergunta ou descrição do problema..."
                    className="pr-12 resize-none"
                    rows={3}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute bottom-3 right-3 h-8 w-8 p-0 bg-[#4D2BFB]"
                    disabled={loading || !prompt.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Suggested Prompts */}
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Prompts Sugeridos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sugestedPrompts.map((text, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-sm"
                    onClick={() => handleSuggestedPrompt(text)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                    {text}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="history" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="knowledge">Conhecimento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="space-y-4">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Conversas Anteriores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {previousConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-[#4D2BFB]/5 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-[#4D2BFB]" />
                        <div>
                          <p className="font-medium text-sm">{conversation.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{conversation.date}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {conversation.messages} msgs
                      </Badge>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    Ver Mais Conversas
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Downloads & Recursos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-[#4D2BFB]/5 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#4D2BFB]" />
                      <span className="text-sm">Guia de Resolução de Problemas</span>
                    </div>
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-[#4D2BFB]/5 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#4D2BFB]" />
                      <span className="text-sm">Manual de Comunicação com Cliente</span>
                    </div>
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-[#4D2BFB]/5 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#4D2BFB]" />
                      <span className="text-sm">Checklist de Diagnóstico</span>
                    </div>
                    <Download className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Base de Conhecimento</CardTitle>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {knowledgeTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="border border-[#4D2BFB]/20 rounded-md p-3 hover:bg-[#4D2BFB]/5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-[#020CBC]">{topic.title}</h4>
                        <Badge variant="secondary">{topic.count} artigos</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {topic.topics.map((subtopic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {subtopic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Busca Avançada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar na base de conhecimento..."
                        className="pl-10"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        Procedimentos
                      </Button>
                      <Button variant="outline" size="sm">
                        Equipamentos
                      </Button>
                      <Button variant="outline" size="sm">
                        Configuração
                      </Button>
                      <Button variant="outline" size="sm">
                        Modelos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// This is just a placeholder component since it was missing in the imports
const Search = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
};

export default AgentCopilot;
