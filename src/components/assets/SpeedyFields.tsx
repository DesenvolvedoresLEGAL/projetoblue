
import { Input } from "@/components/ui/input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectField } from "./SelectField";
import { Control } from "react-hook-form";

interface SpeedyFieldsProps {
  control: Control<any>;
  loadingReferenceData: boolean;
  manufacturers: Array<{ id: number; name: string }>;
  assetSolutions: Array<{ id: number; solution: string }>;
  assetStatus: Array<{ id: number; status: string }>;
  isPending: boolean;
}

export function SpeedyFields({ 
  control, 
  loadingReferenceData, 
  manufacturers, 
  assetSolutions, 
  assetStatus,
  isPending
}: SpeedyFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Archer C6"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormDescription>Modelo do roteador</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Série</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: SN123456789"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormDescription>Número de série do roteador (opcional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="rented_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dias Alugados</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Ex: 0"
                  {...field}
                />
              </FormControl>
              <FormDescription>Total de dias alugados (mínimo 0)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="radio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rádio</FormLabel>
              <FormControl>
                <Input
                  placeholder="Configuração de rádio"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Senha do roteador"
                  {...field}
                />
              </FormControl>
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
            name="solution_id"
            label="Solução"
            placeholder="Selecione a solução"
            options={assetSolutions.map(s => ({ id: s.id, name: s.solution }))}
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
