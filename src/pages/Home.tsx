
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Package,
  HelpCircle,
  Wifi,
  Globe,
  Megaphone,
  BrainCircuit,
  Bell,
  DollarSign,
  LineChart,
  Star,
  Beaker,
  Webhook,
  Users,
  AlertTriangle,
  Activity,
  PlusCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const today = new Date();
  const userName = "Usuário"; // In a real app, get this from user context
  
  // Greeting logic based on time of day
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  // Module data with metrics (would come from an API in a real app)
  const modules = [
    {
      id: "ativos",
      name: "Ativos",
      icon: <Package className="h-6 w-6 text-purple-600" />,
      metric: "12 dispositivos ativos",
      path: "/inventory",
      color: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      action: "Ver inventário"
    },
    {
      id: "suporte",
      name: "Suporte",
      icon: <HelpCircle className="h-6 w-6 text-blue-600" />,
      metric: "3 tickets abertos",
      path: "/support",
      color: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      action: "Ver tickets"
    },
    {
      id: "wifi",
      name: "WiFi",
      icon: <Wifi className="h-6 w-6 text-cyan-600" />,
      metric: "98% de disponibilidade",
      path: "/wifi-metrics",
      color: "bg-cyan-50 dark:bg-cyan-900/20",
      borderColor: "border-cyan-200 dark:border-cyan-800",
      action: "Ver métricas"
    },
    {
      id: "portal",
      name: "Portal",
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
      metric: "250 acessos hoje",
      path: "/splash-page",
      color: "bg-indigo-50 dark:bg-indigo-900/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      action: "Acessar portal"
    },
    {
      id: "campanhas",
      name: "Campanhas",
      icon: <Megaphone className="h-6 w-6 text-pink-600" />,
      metric: "Última: ontem",
      path: "/campaign-sends",
      color: "bg-pink-50 dark:bg-pink-900/20",
      borderColor: "border-pink-200 dark:border-pink-800",
      action: "Ver campanhas"
    },
    {
      id: "ia",
      name: "IA",
      icon: <BrainCircuit className="h-6 w-6 text-violet-600" />,
      metric: "24 assistências automáticas",
      path: "/ai-assistant",
      color: "bg-violet-50 dark:bg-violet-900/20",
      borderColor: "border-violet-200 dark:border-violet-800",
      action: "Abrir assistente"
    },
    {
      id: "alertas",
      name: "Alertas",
      icon: <Bell className="h-6 w-6 text-amber-600" />,
      metric: "5 novos alertas",
      path: "/alert-rules",
      color: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      action: "Ver alertas"
    },
    {
      id: "financeiro",
      name: "Financeiro",
      icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
      metric: "Receita: +10% este mês",
      path: "/financial",
      color: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      action: "Ver relatórios"
    },
    {
      id: "vendas",
      name: "Vendas",
      icon: <Users className="h-6 w-6 text-sky-600" />,
      metric: "3 novos clientes hoje",
      path: "/clients",
      color: "bg-sky-50 dark:bg-sky-900/20",
      borderColor: "border-sky-200 dark:border-sky-800",
      action: "Ver clientes"
    },
    {
      id: "bits",
      name: "BITS",
      icon: <LineChart className="h-6 w-6 text-green-600" />,
      metric: "92% de eficiência",
      path: "/bits",
      color: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      action: "Ver métricas"
    },
    {
      id: "nps",
      name: "NPS",
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      metric: "Pontuação: 8.5/10",
      path: "/nps",
      color: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      action: "Ver feedback"
    },
    {
      id: "lab",
      name: "Lab",
      icon: <Beaker className="h-6 w-6 text-rose-600" />,
      metric: "2 protótipos ativos",
      path: "/prototypes",
      color: "bg-rose-50 dark:bg-rose-900/20",
      borderColor: "border-rose-200 dark:border-rose-800",
      action: "Ver projetos"
    },
    {
      id: "integracoes",
      name: "Integrações",
      icon: <Webhook className="h-6 w-6 text-orange-600" />,
      metric: "12 APIs conectadas",
      path: "/apis",
      color: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      action: "Gerenciar"
    }
  ];

  // Recent activity data (would come from an API in a real app)
  const recentActivities = [
    {
      id: 1,
      description: "Novo cliente cadastrado",
      timestamp: "Há 10 minutos",
      icon: <Users className="h-4 w-4" />,
      link: "/clients"
    },
    {
      id: 2,
      description: "Alerta de conexão WiFi",
      timestamp: "Há 30 minutos",
      icon: <AlertTriangle className="h-4 w-4" />,
      link: "/alert-rules"
    },
    {
      id: 3,
      description: "Roteador atualizado",
      timestamp: "Há 1 hora",
      icon: <Activity className="h-4 w-4" />,
      link: "/inventory"
    },
    {
      id: 4,
      description: "Campanha iniciada",
      timestamp: "Há 3 horas",
      icon: <Megaphone className="h-4 w-4" />,
      link: "/campaign-sends"
    }
  ];

  // Upcoming events (would come from an API in a real app)
  const upcomingEvents = [
    {
      id: 1,
      title: "Manutenção programada",
      date: "Amanhã, 10:00",
      icon: <Package className="h-4 w-4" />
    },
    {
      id: 2,
      title: "Reunião de equipe",
      date: "Quinta, 14:30",
      icon: <Users className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-muted-foreground">
            {formatDate(today)} • Bem-vindo ao seu dashboard
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/register-asset")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Ativo
          </Button>
          <Button onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Métricas Detalhadas
          </Button>
        </div>
      </div>
      
      {/* Main Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Module Cards */}
        {modules.map((module) => (
          <Card 
            key={module.id} 
            className={`hover:shadow-md transition-all ${module.borderColor} border`}
          >
            <CardHeader className={`${module.color} rounded-t-lg`}>
              <CardTitle className="flex items-center gap-2">
                {module.icon}
                {module.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-lg font-medium">{module.metric}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-primary" 
                onClick={() => navigate(module.path)}
              >
                {module.action}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Sidebar Content - Activities and Events */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(activity.link)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver todas as atividades
            </Button>
          </CardFooter>
        </Card>
        
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="bg-primary/10 p-2 rounded-full">
                    {event.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="w-full">
              Ver calendário completo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Home;
