
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Package, Users, PlusCircle } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Sistema</h1>
        <p className="text-muted-foreground">
          Selecione um dos módulos abaixo para começar a utilizar o sistema.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/dashboard")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Dashboard
            </CardTitle>
            <CardDescription>Visualize indicadores e estatísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acesse gráficos e métricas sobre os seus ativos e clientes.
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/inventory")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Inventário
            </CardTitle>
            <CardDescription>Gerencie seus ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consulte, edite e gerencie todos os ativos do sistema.
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/clients")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Clientes
            </CardTitle>
            <CardDescription>Gerencie seus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consulte, edite e gerencie todos os clientes cadastrados.
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate("/register-asset")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Registrar Ativo
            </CardTitle>
            <CardDescription>Adicione novos ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cadastre novos chips, roteadores e outros equipamentos no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
