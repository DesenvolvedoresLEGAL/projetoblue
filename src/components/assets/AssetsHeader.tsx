
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const AssetsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Inventário de Ativos</h1>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Importar
        </Button>
        <Button size="sm"
          onClick={() => navigate("/assets/register")}>
          <PlusCircle className="w-4 h-4 mr-2" />
          <span>Novo Ativo</span>
        </Button>
      </div>
    </div>
  );
};

export default AssetsHeader;
