import { useState } from "react";
import { useAssets } from "@/context/useAssets";
import { ChipAsset, RouterAsset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/utils/toast";
import { AlertTriangle } from "lucide-react";
import { checkPasswordStrength } from "@/utils/passwordStrength";

export default function RegisterAsset() {
  const { addAsset } = useAssets();
  const [assetType, setAssetType] = useState<"CHIP" | "ROTEADOR">("CHIP");
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [allowWeakPassword, setAllowWeakPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for chip
  const [chipForm, setChipForm] = useState<Omit<ChipAsset, "id" | "status">>({
    type: "CHIP",
    iccid: "",
    phoneNumber: "",
    carrier: "VIVO",
    registrationDate: new Date().toISOString(),
  });

  // Form state for router
  const [routerForm, setRouterForm] = useState<Omit<RouterAsset, "id" | "status">>({
    type: "ROTEADOR",
    uniqueId: "",
    brand: "",
    model: "",
    ssid: "",
    password: "",
    registrationDate: new Date().toISOString(),
  });

  const handleChipChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setChipForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCarrierChange = (value: string) => {
    setChipForm((prev) => ({ ...prev, carrier: value }));
  };

  const handleRouterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "password") {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
    
    setRouterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (assetType === "CHIP") {
        // Validate chip form
        if (!chipForm.iccid || !chipForm.phoneNumber || !chipForm.carrier) {
          toast.error("Por favor, preencha todos os campos obrigatórios");
          return;
        }

        // Submit chip
        await addAsset(chipForm);
        setChipForm({
          type: "CHIP",
          iccid: "",
          phoneNumber: "",
          carrier: "VIVO",
          registrationDate: new Date().toISOString(),
        });
      } else {
        // Validate router form
        if (!routerForm.uniqueId || !routerForm.brand || !routerForm.model) {
          toast.error("Por favor, preencha todos os campos obrigatórios");
          return;
        }

        if (passwordStrength === 'weak' && !allowWeakPassword) {
          toast.error("Por favor, use uma senha mais forte ou confirme o uso de senha fraca.");
          return;
        }

        // If weak password is allowed, mark with a flag
        if (passwordStrength === 'weak' && allowWeakPassword) {
          routerForm.hasWeakPassword = true;
        }

        // Submit router
        await addAsset(routerForm);
        setRouterForm({
          type: "ROTEADOR",
          uniqueId: "",
          brand: "",
          model: "",
          ssid: "",
          password: "",
          registrationDate: new Date().toISOString(),
        });
        setPasswordStrength(null);
        setAllowWeakPassword(false);
      }
    } catch (error) {
      console.error("Erro ao cadastrar ativo:", error);
      toast.error("Erro ao cadastrar ativo. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPasswordStrength = () => {
    if (!passwordStrength) return null;

    if (passwordStrength === 'strong') {
      return <div className="text-green-600 text-sm mt-1">Senha forte</div>;
    } else if (passwordStrength === 'medium') {
      return <div className="text-amber-600 text-sm mt-1">Senha média</div>;
    } else {
      return (
        <div className="text-orange-500 text-sm mt-1 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span>Senha fraca</span>
          <div className="ml-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={allowWeakPassword}
                onChange={(e) => setAllowWeakPassword(e.target.checked)}
                className="mr-2"
              />
              Permitir uso de senha fraca
            </label>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Cadastrar Novo Ativo
        </h1>
        <p className="text-muted-foreground">
          Adicione chips e roteadores ao inventário
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs
              value={assetType}
              onValueChange={(value) => setAssetType(value as "CHIP" | "ROTEADOR")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="CHIP">Chip</TabsTrigger>
                <TabsTrigger value="ROTEADOR">Roteador</TabsTrigger>
              </TabsList>

              <TabsContent value="CHIP" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="iccid">ICCID *</Label>
                    <Input
                      id="iccid"
                      name="iccid"
                      value={chipForm.iccid}
                      onChange={handleChipChange}
                      placeholder="Ex: 89550421180216543847"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Número *</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={chipForm.phoneNumber}
                      onChange={handleChipChange}
                      placeholder="Ex: (11) 98765-4321"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carrier">Operadora *</Label>
                    <Select 
                      value={chipForm.carrier} 
                      onValueChange={handleCarrierChange}
                      name="carrier"
                    >
                      <SelectTrigger id="carrier">
                        <SelectValue placeholder="Selecione a operadora" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIVO">VIVO</SelectItem>
                        <SelectItem value="CLARO">CLARO</SelectItem>
                        <SelectItem value="TIM">TIM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chipNotes">Observações</Label>
                  <Textarea
                    id="chipNotes"
                    name="notes"
                    value={chipForm.notes || ""}
                    onChange={handleChipChange}
                    placeholder="Informações adicionais sobre o chip"
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ROTEADOR" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="uniqueId">ID Único *</Label>
                    <Input
                      id="uniqueId"
                      name="uniqueId"
                      value={routerForm.uniqueId}
                      onChange={handleRouterChange}
                      placeholder="Ex: RTR001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={routerForm.brand}
                      onChange={handleRouterChange}
                      placeholder="Ex: TP-Link"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      name="model"
                      value={routerForm.model}
                      onChange={handleRouterChange}
                      placeholder="Ex: Archer C6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ssid">SSID *</Label>
                    <Input
                      id="ssid"
                      name="ssid"
                      value={routerForm.ssid}
                      onChange={handleRouterChange}
                      placeholder="Ex: LEGAL_WIFI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="text"
                      value={routerForm.password}
                      onChange={handleRouterChange}
                      placeholder="Senha da rede Wi-Fi"
                    />
                    {renderPasswordStrength()}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress">IP Gerência</Label>
                    <Input
                      id="ipAddress"
                      name="ipAddress"
                      value={routerForm.ipAddress || ""}
                      onChange={handleRouterChange}
                      placeholder="Ex: 192.168.0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminUser">Usuário Admin</Label>
                    <Input
                      id="adminUser"
                      name="adminUser"
                      value={routerForm.adminUser || ""}
                      onChange={handleRouterChange}
                      placeholder="Ex: admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Senha Admin</Label>
                    <Input
                      id="adminPassword"
                      name="adminPassword"
                      type="text"
                      value={routerForm.adminPassword || ""}
                      onChange={handleRouterChange}
                      placeholder="Senha do admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imei">IMEI</Label>
                    <Input
                      id="imei"
                      name="imei"
                      value={routerForm.imei || ""}
                      onChange={handleRouterChange}
                      placeholder="Ex: 123456789012345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Número de Série</Label>
                    <Input
                      id="serialNumber"
                      name="serialNumber"
                      value={routerForm.serialNumber || ""}
                      onChange={handleRouterChange}
                      placeholder="Ex: SN123456789"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routerNotes">Observações</Label>
                  <Textarea
                    id="routerNotes"
                    name="notes"
                    value={routerForm.notes || ""}
                    onChange={handleRouterChange}
                    placeholder="Informações adicionais sobre o roteador"
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
