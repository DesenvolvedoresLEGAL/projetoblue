
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { chipSchema, equipmentSchema } from "./schemas";
import { ChipFormValues, EquipmentFormValues } from "./types";
import { useAssetRegistrationState } from "@modules/assets/hooks/useAssetRegistrationState";

export function useFormSetup() {
  const { chipFormData, equipmentFormData } = useAssetRegistrationState();

  const chipForm = useForm<ChipFormValues>({
    resolver: zodResolver(chipSchema),
    defaultValues: {
      line_number: undefined,
      iccid: "",
      manufacturer_id: undefined,
      status_id: 1,
      ...chipFormData,
    }
  });

  const equipmentForm = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      serial_number: "",
      model: "",
      rented_days: 0,
      radio: "",
      status_id: 1,
      manufacturer_id: undefined,
      solution_id: undefined,
      admin_user: "admin",
      admin_pass: "",
      ssid_fabrica: "",
      pass_fabrica: "",
      admin_user_fabrica: "admin",
      admin_pass_fabrica: "",
      ssid_atual: "",
      pass_atual: "",
      ...equipmentFormData,
    }
  });

  return {
    chipForm,
    equipmentForm
  };
}
