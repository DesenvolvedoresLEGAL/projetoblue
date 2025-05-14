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
          association_id: number
          client_id: string
          entry_date: string
          exit_date: string | null
          id: number
        }
        Insert: {
          asset_id: string
          association_id: number
          client_id: string
          entry_date: string
          exit_date?: string | null
          id?: number
        }
        Update: {
          asset_id?: string
          association_id?: number
          client_id?: string
          entry_date?: string
          exit_date?: string | null
          id?: number
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
          {
            foreignKeyName: "fk_assoc_association_type"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "association_types"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_logs: {
        Row: {
          assoc_id: number | null
          date: string | null
          details: Json | null
          event: string | null
          id: number
          status_after_id: number | null
          status_before_id: number | null
        }
        Insert: {
          assoc_id?: number | null
          date?: string | null
          details?: Json | null
          event?: string | null
          id?: number
          status_after_id?: number | null
          status_before_id?: number | null
        }
        Update: {
          assoc_id?: number | null
          date?: string | null
          details?: Json | null
          event?: string | null
          id?: number
          status_after_id?: number | null
          status_before_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_histories_assoc_id_fkey"
            columns: ["assoc_id"]
            isOneToOne: false
            referencedRelation: "asset_client_assoc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_histories_assoc_id_fkey1"
            columns: ["assoc_id"]
            isOneToOne: false
            referencedRelation: "asset_client_assoc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asset_history_status_after"
            columns: ["status_after_id"]
            isOneToOne: false
            referencedRelation: "asset_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asset_history_status_before"
            columns: ["status_before_id"]
            isOneToOne: false
            referencedRelation: "asset_status"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_solutions: {
        Row: {
          id: number
          solution: string
        }
        Insert: {
          id?: number
          solution: string
        }
        Update: {
          id?: number
          solution?: string
        }
        Relationships: []
      }
      asset_status: {
        Row: {
          association: number | null
          id: number
          status: string
        }
        Insert: {
          association?: number | null
          id?: number
          status: string
        }
        Update: {
          association?: number | null
          id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_association_fkey"
            columns: ["association"]
            isOneToOne: false
            referencedRelation: "association_types"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_types: {
        Row: {
          id: number
          type: string
        }
        Insert: {
          id?: number
          type: string
        }
        Update: {
          id?: number
          type?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          iccid: string | null
          line_number: number | null
          manufacturer_id: number | null
          model: string | null
          password: string | null
          plan_id: number | null
          radio: string | null
          rented_days: number
          serial_number: string | null
          solution_id: number | null
          status_id: number | null
          type_id: number | null
          uuid: string
        }
        Insert: {
          iccid?: string | null
          line_number?: number | null
          manufacturer_id?: number | null
          model?: string | null
          password?: string | null
          plan_id?: number | null
          radio?: string | null
          rented_days?: number
          serial_number?: string | null
          solution_id?: number | null
          status_id?: number | null
          type_id?: number | null
          uuid?: string
        }
        Update: {
          iccid?: string | null
          line_number?: number | null
          manufacturer_id?: number | null
          model?: string | null
          password?: string | null
          plan_id?: number | null
          radio?: string | null
          rented_days?: number
          serial_number?: string | null
          solution_id?: number | null
          status_id?: number | null
          type_id?: number | null
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assets_solutions"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "asset_solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assets_status"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "asset_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_assets_type"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "asset_types"
            referencedColumns: ["id"]
          },
        ]
      }
      association_types: {
        Row: {
          id: number
          type: string
        }
        Insert: {
          id?: number
          type: string
        }
        Update: {
          id?: number
          type?: string
        }
        Relationships: []
      }
      bits_points_log: {
        Row: {
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          points: number
          related_referral_id: string | null
          related_reward_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          related_referral_id?: string | null
          related_reward_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          related_referral_id?: string | null
          related_reward_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bits_points_log_related_referral_id_fkey"
            columns: ["related_referral_id"]
            isOneToOne: false
            referencedRelation: "bits_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bits_points_log_related_reward_id_fkey"
            columns: ["related_reward_id"]
            isOneToOne: false
            referencedRelation: "bits_rewards_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bits_points_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bits_referrals: {
        Row: {
          created_at: string | null
          id: string
          points_earned: number | null
          referral_link_used: string | null
          referred_company: string | null
          referred_email: string
          referred_name: string
          referred_phone: string | null
          referrer_user_id: string
          status:
            | Database["public"]["Enums"]["bits_referral_status_enum"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_earned?: number | null
          referral_link_used?: string | null
          referred_company?: string | null
          referred_email: string
          referred_name: string
          referred_phone?: string | null
          referrer_user_id: string
          status?:
            | Database["public"]["Enums"]["bits_referral_status_enum"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          points_earned?: number | null
          referral_link_used?: string | null
          referred_company?: string | null
          referred_email?: string
          referred_name?: string
          referred_phone?: string | null
          referrer_user_id?: string
          status?:
            | Database["public"]["Enums"]["bits_referral_status_enum"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bits_referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bits_rewards_catalog: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      bits_user_rewards: {
        Row: {
          id: string
          points_spent: number
          redeemed_at: string | null
          reward_id: string
          user_id: string
        }
        Insert: {
          id?: string
          points_spent: number
          redeemed_at?: string | null
          reward_id: string
          user_id: string
        }
        Update: {
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bits_user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "bits_rewards_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bits_user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          cnpj: string
          contato: number
          email: string | null
          nome: string
          uuid: string
        }
        Insert: {
          cnpj: string
          contato: number
          email?: string | null
          nome: string
          uuid?: string
        }
        Update: {
          cnpj?: string
          contato?: number
          email?: string | null
          nome?: string
          uuid?: string
        }
        Relationships: []
      }
      location_types: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          type_id: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          type_id?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          type_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "locations_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "location_types"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          id: number
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at: string
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: number
          nome: string
          tamanho_gb: number | null
        }
        Insert: {
          id?: number
          nome: string
          tamanho_gb?: number | null
        }
        Update: {
          id?: number
          nome?: string
          tamanho_gb?: number | null
        }
        Relationships: []
      }
      profile_logs: {
        Row: {
          changed_at: string
          email: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          changed_at?: string
          email?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          changed_at?: string
          email?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bits_referral_code: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          last_login: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
        }
        Insert: {
          bits_referral_code?: string | null
          created_at?: string
          email: string
          id: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
        }
        Update: {
          bits_referral_code?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_afiliado: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      status_by_asset_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          type: string
          status: string
          total: number
        }[]
      }
    }
    Enums: {
      asset_status_enum:
        | "Disponível"
        | "Alugado"
        | "Assinatura"
        | "Sem Dados"
        | "Bloqueado"
        | "Manutenção"
      asset_type_enum: "chip" | "roteador"
      association_type_enum: "aluguel" | "assinatura"
      bits_referral_status_enum:
        | "pendente"
        | "em_negociacao"
        | "fechado"
        | "perdido"
      solution_type_enum:
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
      user_role_enum: "admin" | "ops" | "suport" | "user" | "afiliado"
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
      asset_status_enum: [
        "Disponível",
        "Alugado",
        "Assinatura",
        "Sem Dados",
        "Bloqueado",
        "Manutenção",
      ],
      asset_type_enum: ["chip", "roteador"],
      association_type_enum: ["aluguel", "assinatura"],
      bits_referral_status_enum: [
        "pendente",
        "em_negociacao",
        "fechado",
        "perdido",
      ],
      solution_type_enum: [
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
      user_role_enum: ["admin", "ops", "suport", "user", "afiliado"],
    },
  },
} as const
