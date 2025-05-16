
import { Input } from "@/components/ui/input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectField } from "./SelectField";
import { Control } from "react-hook-form";

interface ChipFieldsProps {
  control: Control<any>;
  loadingReferenceData: boolean;
  manufacturers: Array<{ id: number; name: string }>;
  plans: Array<{ id: number; nome: string; tamanho_gb?: number }>;
  assetStatus: Array<{ id: number; status: string }>;
  isPending: boolean;
}

export function ChipFields({ 
  control, 
  loadingReferenceData, 
  manufacturers, 
  plans, 
  assetStatus,
  isPending
}: ChipFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="iccid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ICCID *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: 89550421180216543847"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Número de 19 ou 20 dígitos do chip
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="line_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número da Linha</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex: 11999999999"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormDescription>Número da linha associada ao chip (opcional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input value="NANOSIM" disabled {...field} />
              </FormControl>
              <FormDescription>Modelo fixo para chips</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {loadingReferenceData ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <SelectField
            control={control}
            name="manufacturer_id"
            label="Fabricante"
            placeholder="Selecione o fabricante"
            options={manufacturers.map(m => ({ id: m.id, name: m.name }))}
            disabled={isPending}
            required
          />
        )}

        {loadingReferenceData ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <SelectField
            control={control}
            name="plan_id"
            label="Plano"
            placeholder="Selecione o plano"
            options={plans.map(p => ({ id: p.id, name: `${p.nome} ${p.tamanho_gb ? `(${p.tamanho_gb}GB)` : ''}` }))}
            disabled={isPending}
          />
        )}

        {loadingReferenceData ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <SelectField
            control={control}
            name="status_id"
            label="Status"
            placeholder="Selecione o status"
            options={assetStatus.map(s => ({ id: s.id, name: s.status }))}
            disabled={isPending}
            required
          />
        )}
      </div>
    </>
  );
}
