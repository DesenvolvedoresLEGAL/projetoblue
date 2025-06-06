
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientRegistrationFormData } from '@/modules/clients/hooks/useClientRegistrationState';

interface ClientFormFieldsProps {
  formData: ClientRegistrationFormData;
  onUpdateField: (field: keyof ClientRegistrationFormData, value: string | string[]) => void;
}

export const ClientFormFields: React.FC<ClientFormFieldsProps> = ({
  formData,
  onUpdateField
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="empresa" className="font-neue-haas font-bold text-[#020CBC]">
          Nome da Empresa *
        </Label>
        <Input
          id="empresa"
          value={formData.empresa}
          onChange={(e) => onUpdateField('empresa', e.target.value)}
          placeholder="Digite o nome da empresa"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsavel" className="font-neue-haas font-bold text-[#020CBC]">
          Nome do Responsável *
        </Label>
        <Input
          id="responsavel"
          value={formData.responsavel}
          onChange={(e) => onUpdateField('responsavel', e.target.value)}
          placeholder="Digite o nome do responsável"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="font-neue-haas font-bold text-[#020CBC]">
          Email (opcional)
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onUpdateField('email', e.target.value)}
          placeholder="cliente@empresa.com"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj" className="font-neue-haas font-bold text-[#020CBC]">
          CNPJ (opcional)
        </Label>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={(e) => onUpdateField('cnpj', e.target.value)}
          placeholder="00.000.000/0000-00"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
        />
      </div>
    </>
  );
};
