
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Hash, Phone, Briefcase } from "lucide-react";

interface ChipFormProps {
  chipData: {
    iccid: string;
    phoneNumber: string;
    carrier: string;
  };
  setChipData: React.Dispatch<React.SetStateAction<{
    iccid: string;
    phoneNumber: string;
    carrier: string;
  }>>;
  errors: Record<string, string>;
}

const ChipForm = ({ chipData, setChipData, errors }: ChipFormProps) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="iccid" className="flex items-center gap-1">
          <Hash className="h-4 w-4" />
          ICCID
        </Label>
        <Input
          id="iccid"
          value={chipData.iccid}
          onChange={(e) => setChipData({ ...chipData, iccid: e.target.value })}
          className={errors.iccid ? "border-red-500" : ""}
        />
        {errors.iccid && <p className="text-xs text-red-500">{errors.iccid}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="flex items-center gap-1">
          <Phone className="h-4 w-4" />
          Número de Telefone
        </Label>
        <Input
          id="phoneNumber"
          value={chipData.phoneNumber}
          onChange={(e) => setChipData({ ...chipData, phoneNumber: e.target.value })}
          className={errors.phoneNumber ? "border-red-500" : ""}
        />
        {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="carrier" className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          Operadora
        </Label>
        <Input
          id="carrier"
          value={chipData.carrier}
          onChange={(e) => setChipData({ ...chipData, carrier: e.target.value })}
          className={errors.carrier ? "border-red-500" : ""}
        />
        {errors.carrier && <p className="text-xs text-red-500">{errors.carrier}</p>}
      </div>
    </div>
  );
};

export default ChipForm;
