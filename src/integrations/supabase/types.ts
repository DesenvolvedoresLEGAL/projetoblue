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
      chips: {
        Row: {
          created_at: string
          iccid: string
          id: string
          numero: string
          observacoes: string | null
          operadora: string
          status_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          iccid: string
          id?: string
          numero: string
          observacoes?: string | null
          operadora: string
          status_id?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          iccid?: string
          id?: string
          numero?: string
          observacoes?: string | null
          operadora?: string
          status_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chips_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          role_name: string
        }
        Insert: {
          id?: never
          role_name: string
        }
        Update: {
          id?: never
          role_name?: string
        }
        Relationships: []
      }
      roteadores: {
        Row: {
          created_at: string
          id: string
          id_unico: string
          imei: string | null
          ip_gerencia: string | null
          marca: string
          modelo: string
          numero_serie: string | null
          observacoes: string | null
          senha_admin: string | null
          senha_wifi: string | null
          ssid: string | null
          status_id: number
          updated_at: string
          usuario_admin: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          id_unico: string
          imei?: string | null
          ip_gerencia?: string | null
          marca: string
          modelo: string
          numero_serie?: string | null
          observacoes?: string | null
          senha_admin?: string | null
          senha_wifi?: string | null
          ssid?: string | null
          status_id?: number
          updated_at?: string
          usuario_admin?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          id_unico?: string
          imei?: string | null
          ip_gerencia?: string | null
          marca?: string
          modelo?: string
          numero_serie?: string | null
          observacoes?: string | null
          senha_admin?: string | null
          senha_wifi?: string | null
          ssid?: string | null
          status_id?: number
          updated_at?: string
          usuario_admin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roteadores_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status"
            referencedColumns: ["id"]
          },
        ]
      }
      status: {
        Row: {
          id: number
          nome: string
        }
        Insert: {
          id?: number
          nome: string
        }
        Update: {
          id?: number
          nome?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string
          id_role: number | null
          is_approved: boolean
          password: string
          uuid: string
        }
        Insert: {
          email: string
          id_role?: number | null
          is_approved?: boolean
          password: string
          uuid?: string
        }
        Update: {
          email?: string
          id_role?: number | null
          is_approved?: boolean
          password?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_role_fkey"
            columns: ["id_role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
