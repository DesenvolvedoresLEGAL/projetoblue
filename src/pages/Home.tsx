
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DashboardKpis,
  AssetsChart,
  EventsTimeline,
  AlertsPanel,
  QuickActions
} from "@/components/dashboard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/utils/toast";

const Home = () => {
  const handleWelcome = () => {
    toast({
      title: "Bem-vindo à BLUE Platform",
      description: "Plataforma de gerenciamento de inventário de ativos da LEGAL",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo à BLUE Platform</h1>
          <p className="text-muted-foreground">Gerencie seu inventário de ativos de forma centralizada</p>
        </div>
        <Button onClick={handleWelcome}>Começar</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content area (70%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* KPIs */}
          <DashboardKpis />
          
          {/* Featured Card */}
          <Card className="overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle>Gerencie seu inventário de ativos</CardTitle>
              <CardDescription className="text-blue-100">
                Plataforma completa para controle de equipamentos, chips e conexões
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p>A BLUE Platform oferece:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500/10 p-1 mt-0.5">
                      <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </div>
                    <span>Inventário centralizado de todos os ativos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500/10 p-1 mt-0.5">
                      <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </div>
                    <span>Monitoramento em tempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500/10 p-1 mt-0.5">
                      <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </div>
                    <span>Relatórios personalizáveis e exportáveis</span>
                  </li>
                </ul>
                
                <div className="pt-4">
                  <Link to="/inventory/assets">
                    <Button className="w-full sm:w-auto">
                      Ver Inventário
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Chart */}
          <div className="rounded-2xl border bg-card shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Ativos Registrados (Últimos 7 Dias)</h2>
            <AssetsChart />
          </div>
          
          {/* Timeline */}
          <div className="rounded-2xl border bg-card shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Eventos Recentes</h2>
            <EventsTimeline />
          </div>
        </div>
        
        {/* Right sidebar (30%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alerts */}
          <AlertsPanel />
          
          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Home;
