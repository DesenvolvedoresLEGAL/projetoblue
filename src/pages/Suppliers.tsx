
import { useState } from "react";
import { Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Suppliers = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie fabricantes, operadoras e parceiros comerciais
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            <span>Lista de Fornecedores</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Funcionalidade em desenvolvimento. Em breve você poderá gerenciar seus fornecedores aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers;
