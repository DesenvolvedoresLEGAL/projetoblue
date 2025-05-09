
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  LayoutDashboard, 
  Users, 
  Building, 
  Clock, 
  History, 
  ActivitySquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: "inventario",
      title: "Módulo de Inventário",
      description: "Gerencie e monitore seus ativos, clientes, fornecedores e assinaturas",
      icon: <Package className="h-12 w-12 text-primary" />,
      route: "/inventario/dashboard"
    },
    // Espaço para adicionar outros módulos no futuro
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          Telecom Asset Nexus
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Plataforma completa para gerenciamento de ativos de telecomunicações
        </p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Comece pelo módulo desejado
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="flex flex-col h-full transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex justify-center mb-4">
                {module.icon}
              </div>
              <CardTitle className="text-xl text-center">{module.title}</CardTitle>
              <CardDescription className="text-center">
                {module.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {module.id === "inventario" && (
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Dashboard</li>
                  <li>Ativos</li>
                  <li>Clientes</li>
                  <li>Fornecedores</li>
                  <li>Assinaturas</li>
                  <li>Histórico</li>
                  <li>Monitoramento</li>
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate(module.route)}
                aria-label={`Acessar ${module.title}`}
              >
                Acessar Módulo
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
