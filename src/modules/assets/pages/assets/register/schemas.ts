
import { z } from "zod";

export const chipSchema = z.object({
  line_number: z.number().min(1, "Número da linha é obrigatório"),
  iccid: z.string().min(1, "ICCID é obrigatório"),
  manufacturer_id: z.number().min(1, "Operadora é obrigatória"),
  status_id: z.number().min(1, "Status é obrigatório"),
});

export const equipmentSchema = z.object({
  serial_number: z.string().min(1, "Número de série é obrigatório"),
  model: z.string().min(1, "Modelo é obrigatório"),
  rented_days: z.number().min(0, "Dias alugada deve ser 0 ou maior"),
  radio: z.string().min(1, "Rádio é obrigatório"),
  status_id: z.number().min(1, "Status é obrigatório"),
  manufacturer_id: z.number().min(1, "Fabricante é obrigatório"),
  solution_id: z.number().min(1, "Solução é obrigatória"),
  admin_user: z.string().min(1, "Usuário admin é obrigatório"),
  admin_pass: z.string().min(1, "Senha admin é obrigatória"),
  // Campos de configurações de rede - Fábrica (obrigatórios)
  ssid_fabrica: z.string().min(1, "SSID de fábrica é obrigatório"),
  pass_fabrica: z.string().min(1, "Senha WiFi de fábrica é obrigatória"),
  admin_user_fabrica: z.string().min(1, "Usuário admin de fábrica é obrigatório"),
  admin_pass_fabrica: z.string().min(1, "Senha admin de fábrica é obrigatória"),
  // Campos de configurações de rede - Atuais (opcionais)
  ssid_atual: z.string().optional(),
  pass_atual: z.string().optional(),
});
