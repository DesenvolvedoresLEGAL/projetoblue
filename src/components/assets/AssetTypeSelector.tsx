
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetTypeSelectorProps {
  value: "CHIP" | "SPEEDY";
  onChange: (value: "CHIP" | "SPEEDY") => void;
}

export function AssetTypeSelector({ value, onChange }: AssetTypeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipo de Ativo</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          className="flex flex-col md:flex-row gap-4 mb-8"
          value={value}
          onValueChange={(v) => onChange(v as "CHIP" | "SPEEDY")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="CHIP" id="chip" />
            <Label htmlFor="chip">Chip</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SPEEDY" id="speedy" />
            <Label htmlFor="speedy">Speedy 5G (Roteador)</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
