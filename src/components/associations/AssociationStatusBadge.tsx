
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface AssociationStatusBadgeProps {
  exitDate: string | null;
}

export const AssociationStatusBadge: React.FC<AssociationStatusBadgeProps> = ({ exitDate }) => {
  const today = new Date().toISOString().split('T')[0];
  
  if (!exitDate) {
    return <Badge className="bg-green-500">Ativa</Badge>;
  }
  
  if (exitDate === today) {
    return <Badge variant="warning">Encerra hoje</Badge>;
  }
  
  if (exitDate < today) {
    return <Badge variant="outline">Encerrada</Badge>;
  }
  
  return <Badge className="bg-green-500">Ativa</Badge>;
};
