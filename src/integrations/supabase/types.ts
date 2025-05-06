export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      asset_client_assoc: {
        Row: {
          asset_id: string
          client_id: string
          dt_entrada: string
          dt_saida: string | null
          id: number
          tipo_associacao: string | null
        }
        Insert: {
          asset_id: string
          client_id: string
          dt_entrada: string
          dt_saida?: string | null
          id?: number
          tipo_associacao?: string | null
        }
        Update: {
          asset_id?: string
          client_id?: string
          dt_entrada?: string
          dt_saida?: string | null
          id?: number
          tipo_associacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_client_assoc_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "asset_client_assoc_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["uuid"]
          },
        ]
      }
      asset_history: {
        Row: {
          assoc_id: number | null
          data: string | null
          detalhes: Json | null
          evento: string | null
          id: number
          status_after: Database["public"]["Enums"]["asset_status"] | null
          status_before: Database["public"]["Enums"]["asset_status"] | null
        }
        Insert: {
          assoc_id?: number | null
          data?: string | null
          detalhes?: Json | null
          evento?: string | null
          id?: number
          status_after?: Database["public"]["Enums"]["asset_status"] | null
          status_before?: Database["public"]["Enums"]["asset_status"] | null
        }
        Update: {
          assoc_id?: number | null
          data?: string | null
          detalhes?: Json | null
          evento?: string | null
          id?: number
          status_after?: Database["public"]["Enums"]["asset_status"] | null
          status_before?: Database["public"]["Enums"]["asset_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_history_assoc_id_fkey"
            columns: ["assoc_id"]
            isOneToOne: false
            referencedRelation: "asset_client_assoc"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          dias_alugada: number | null
          iccid: string | null
          marca: string | null
          modelo: string | null
          num_linha: number | null
          operadora_id: number | null
          pacote_id: number | null
          radio: string | null
          serial_number: string | null
          solucao: Database["public"]["Enums"]["solution"] | null
          status: Database["public"]["Enums"]["asset_status"] | null
          type: Database["public"]["Enums"]["asset_type"] | null
          uuid: string
        }
        Insert: {
          dias_alugada?: number | null
          iccid?: string | null
          marca?: string | null
          modelo?: string | null
          num_linha?: number | null
          operadora_id?: number | null
          pacote_id?: number | null
          radio?: string | null
          serial_number?: string | null
          solucao?: Database["public"]["Enums"]["solution"] | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          type?: Database["public"]["Enums"]["asset_type"] | null
          uuid?: string
        }
        Update: {
          dias_alugada?: number | null
          iccid?: string | null
          marca?: string | null
          modelo?: string | null
          num_linha?: number | null
          operadora_id?: number | null
          pacote_id?: number | null
          radio?: string | null
          serial_number?: string | null
          solucao?: Database["public"]["Enums"]["solution"] | null
          status?: Database["public"]["Enums"]["asset_status"] | null
          type?: Database["public"]["Enums"]["asset_type"] | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_operadora_id_fkey"
            columns: ["operadora_id"]
            isOneToOne: false
            referencedRelation: "operadoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          cnpj: string | null
          contato: number | null
          email: string | null
          nome: string | null
          uuid: string
        }
        Insert: {
          cnpj?: string | null
          contato?: number | null
          email?: string | null
          nome?: string | null
          uuid?: string
        }
        Update: {
          cnpj?: string | null
          contato?: number | null
          email?: string | null
          nome?: string | null
          uuid?: string
        }
        Relationships: []
      }
      operadoras: {
        Row: {
          id: number
          nome: string | null
        }
        Insert: {
          id?: number
          nome?: string | null
        }
        Update: {
          id?: number
          nome?: string | null
        }
        Relationships: []
      }
      pacotes: {
        Row: {
          id: number
          nome: string | null
          tamanho_gb: number | null
        }
        Insert: {
          id?: number
          nome?: string | null
          tamanho_gb?: number | null
        }
        Update: {
          id?: number
          nome?: string | null
          tamanho_gb?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      asset_status:
        | "Disponível"
        | "Alugado"
        | "Assinatura"
        | "Sem Dados"
        | "Bloqueado"
        | "Manutenção"
      asset_type: "chip" | "roteador"
      solution:
        | "SPEEDY 5G"
        | "4BLACK"
        | "4LITE"
        | "4PLUS"
        | "AP BLUE"
        | "POWERBANK"
        | "SWITCH"
        | "HUB USB"
        | "ANTENA"
        | "LOAD BALANCE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      asset_status: [
        "Disponível",
        "Alugado",
        "Assinatura",
        "Sem Dados",
        "Bloqueado",
        "Manutenção",
      ],
      asset_type: ["chip", "roteador"],
      solution: [
        "SPEEDY 5G",
        "4BLACK",
        "4LITE",
        "4PLUS",
        "AP BLUE",
        "POWERBANK",
        "SWITCH",
        "HUB USB",
        "ANTENA",
        "LOAD BALANCE",
      ],
    },
  },
} as const
