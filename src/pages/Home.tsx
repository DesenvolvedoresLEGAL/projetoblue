
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
      id: "inventory",
      title: "Inventory Module",
      description: "Manage and monitor your assets, customers, suppliers and subscriptions",
      icon: <Package className="h-12 w-12 text-primary" />,
      route: "/inventory/dashboard"
    },
    // Space for adding other modules in the future
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
          BLUE
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Complete platform for telecommunications asset management
        </p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Start with your desired module
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
              {module.id === "inventory" && (
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  <li>Dashboard</li>
                  <li>Assets</li>
                  <li>Customers</li>
                  <li>Suppliers</li>
                  <li>Subscriptions</li>
                  <li>Monitoring</li>
                  <li>History</li>
                  <li>Tools</li>
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate(module.route)}
                aria-label={`Access ${module.title}`}
              >
                Access Module
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
