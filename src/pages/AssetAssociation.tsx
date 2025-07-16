
import React from "react";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { AssociationFlow } from "@/modules/associations/components/AssociationFlow";
import { Link } from "lucide-react";

const AssetAssociation = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <StandardPageHeader 
        title="Nova Associação de Ativos"
        description="Cadastre uma nova associação entre ativos e clientes"
        icon={Link}
      />
      <AssociationFlow />
    </div>
  );
};

export default AssetAssociation;
