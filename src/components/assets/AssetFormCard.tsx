
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Loader } from "lucide-react";
import { UseFormReturn, SubmitHandler } from "react-hook-form";
import { ChipFields } from "./ChipFields";
import { SpeedyFields } from "./SpeedyFields";
import { AssetFormData } from "./AssetSchemas";

interface AssetFormCardProps {
  assetType: "CHIP" | "SPEEDY";
  form: UseFormReturn<AssetFormData>;
  onSubmit: SubmitHandler<AssetFormData>;
  isPending: boolean;
  typeId: number;
  manufacturers: Array<{ id: number; name: string }>;
  plans: Array<{ id: number; nome: string; tamanho_gb?: number }>;
  assetStatus: Array<{ id: number; status: string }>;
  assetSolutions: Array<{ id: number; solution: string }>;
  loadingReferenceData: boolean;
}

export function AssetFormCard({
  assetType,
  form,
  onSubmit,
  isPending,
  typeId,
  manufacturers,
  plans,
  assetStatus,
  assetSolutions,
  loadingReferenceData,
}: AssetFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {assetType === "CHIP" ? "Detalhes do Chip" : "Detalhes do Speedy 5G"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {typeId === 1 ? (
              <ChipFields 
                control={form.control}
                loadingReferenceData={loadingReferenceData}
                manufacturers={manufacturers}
                plans={plans}
                assetStatus={assetStatus}
                isPending={isPending}
              />
            ) : (
              <SpeedyFields 
                control={form.control}
                loadingReferenceData={loadingReferenceData}
                manufacturers={manufacturers}
                assetSolutions={assetSolutions}
                assetStatus={assetStatus}
                isPending={isPending}
              />
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  `Cadastrar ${assetType === "CHIP" ? "Chip" : "Speedy 5G"}`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
