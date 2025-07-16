export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      asset_client_assoc: {
        Row: {
          asset_id: string
          association_id: number
          client_id: string
          created_at: string
          deleted_at: string | null
          entry_date: string
          exit_date: string | null
          gb: number | null
          id: number
          notes: string | null
          pass: string | null
          plan_id: number | null
          ssid: string | null
          updated_at: string
        }
        Insert: {
          asset_id: string
          association_id: number
          client_id: string
          created_at?: string
          deleted_at?: string | null
          entry_date: string
          exit_date?: string | null
          gb?: number | null
          id?: number
          notes?: string | null
          pass?: string | null
          plan_id?: number | null
          ssid?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string
          association_id?: number
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          entry_date?: string
          exit_date?: string | null
          gb?: number | null
          id?: number
          notes?: string | null
          pass?: string | null
          plan_id?: number | null
          ssid?: string | null
          updated_at?: string
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
            foreignKeyName: "asset_client_assoc_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_problem_assets"
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
            foreignKeyName: "asset_client_assoc_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
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
          asset_id: string
          created_at: string
          deleted_at: string | null
          details: Json
          event: string
          status_after_id: number | null
          status_before_id: number | null
          updated_at: string
          user_id: string
          uuid: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          deleted_at?: string | null
          details: Json
          event: string
          status_after_id?: number | null
          status_before_id?: number | null
          updated_at?: string
          user_id: string
          uuid?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          deleted_at?: string | null
          details?: Json
          event?: string
          status_after_id?: number | null
          status_before_id?: number | null
          updated_at?: string
          user_id?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "asset_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "v_problem_assets"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "asset_logs_status_after_id_fkey"
            columns: ["status_after_id"]
            isOneToOne: false
            referencedRelation: "asset_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_logs_status_before_id_fkey"
            columns: ["status_before_id"]
            isOneToOne: false
            referencedRelation: "asset_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_logs_legacy: {
        Row: {
          assoc_id: number | null
          created_at: string
          date: string | null
          deleted_at: string | null
          details: Json | null
          event: string | null
          id: number
          status_after_id: number | null
          status_before_id: number | null
          updated_at: string
        }
        Insert: {
          assoc_id?: number | null
          created_at?: string
          date?: string | null
          deleted_at?: string | null
          details?: Json | null
          event?: string | null
          id?: number
          status_after_id?: number | null
          status_before_id?: number | null
          updated_at?: string
        }
        Update: {
          assoc_id?: number | null
          created_at?: string
          date?: string | null
          deleted_at?: string | null
          details?: Json | null
          event?: string | null
          id?: number
          status_after_id?: number | null
          status_before_id?: number | null
          updated_at?: string
        }
        Relationships: [
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
          {
            foreignKeyName: "fk_asset_logs_assoc_id"
            columns: ["assoc_id"]
            isOneToOne: false
            referencedRelation: "asset_client_assoc"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asset_logs_status_after"
            columns: ["status_after_id"]
            isOneToOne: false
            referencedRelation: "asset_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_asset_logs_status_before"
            columns: ["status_before_id"]
            isOneToOne: false
            referencedRelation: "asset_status"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_solutions: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          solution: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          solution: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          solution?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_status: {
        Row: {
          association: number | null
          created_at: string
          deleted_at: string | null
          id: number
          status: string
          updated_at: string
        }
        Insert: {
          association?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          status: string
          updated_at?: string
        }
        Update: {
          association?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          status?: string
          updated_at?: string
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
      assets: {
        Row: {
          admin_pass: string
          admin_pass_fabrica: string | null
          admin_user: string
          admin_user_fabrica: string | null
          created_at: string | null
          deleted_at: string | null
          iccid: string | null
          line_number: number | null
          manufacturer_id: number | null
          model: string | null
          pass_atual: string | null
          pass_fabrica: string | null
          plan_id: number | null
          radio: string | null
          rented_days: number
          serial_number: string | null
          solution_id: number | null
          ssid_atual: string | null
          ssid_fabrica: string | null
          status_id: number | null
          updated_at: string
          uuid: string
        }
        Insert: {
          admin_pass?: string
          admin_pass_fabrica?: string | null
          admin_user?: string
          admin_user_fabrica?: string | null
          created_at?: string | null
          deleted_at?: string | null
          iccid?: string | null
          line_number?: number | null
          manufacturer_id?: number | null
          model?: string | null
          pass_atual?: string | null
          pass_fabrica?: string | null
          plan_id?: number | null
          radio?: string | null
          rented_days?: number
          serial_number?: string | null
          solution_id?: number | null
          ssid_atual?: string | null
          ssid_fabrica?: string | null
          status_id?: number | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          admin_pass?: string
          admin_pass_fabrica?: string | null
          admin_user?: string
          admin_user_fabrica?: string | null
          created_at?: string | null
          deleted_at?: string | null
          iccid?: string | null
          line_number?: number | null
          manufacturer_id?: number | null
          model?: string | null
          pass_atual?: string | null
          pass_fabrica?: string | null
          plan_id?: number | null
          radio?: string | null
          rented_days?: number
          serial_number?: string | null
          solution_id?: number | null
          ssid_atual?: string | null
          ssid_fabrica?: string | null
          status_id?: number | null
          updated_at?: string
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
        ]
      }
      association_logs: {
        Row: {
          association_uuid: string
          created_at: string
          deleted_at: string | null
          details: Json
          event: string
          updated_at: string
          user_id: string
          uuid: string
        }
        Insert: {
          association_uuid: string
          created_at?: string
          deleted_at?: string | null
          details: Json
          event: string
          updated_at?: string
          user_id: string
          uuid?: string
        }
        Update: {
          association_uuid?: string
          created_at?: string
          deleted_at?: string | null
          details?: Json
          event?: string
          updated_at?: string
          user_id?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "association_logs_association_uuid_fkey"
            columns: ["association_uuid"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "association_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      association_types: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      associations: {
        Row: {
          association_type_id: number
          chip_id: string | null
          client_id: string
          created_at: string
          deleted_at: string | null
          entry_date: string
          equipment_id: string | null
          equipment_pass: string | null
          equipment_ssid: string | null
          exit_date: string | null
          notes: string | null
          plan_gb: number | null
          plan_id: number | null
          status: boolean
          updated_at: string
          uuid: string
        }
        Insert: {
          association_type_id: number
          chip_id?: string | null
          client_id: string
          created_at?: string
          deleted_at?: string | null
          entry_date: string
          equipment_id?: string | null
          equipment_pass?: string | null
          equipment_ssid?: string | null
          exit_date?: string | null
          notes?: string | null
          plan_gb?: number | null
          plan_id?: number | null
          status?: boolean
          updated_at?: string
          uuid?: string
        }
        Update: {
          association_type_id?: number
          chip_id?: string | null
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          entry_date?: string
          equipment_id?: string | null
          equipment_pass?: string | null
          equipment_ssid?: string | null
          exit_date?: string | null
          notes?: string | null
          plan_gb?: number | null
          plan_id?: number | null
          status?: boolean
          updated_at?: string
          uuid?: string
        }
        Relationships: [
          {
            foreignKeyName: "association_type_id_fkey"
            columns: ["association_type_id"]
            isOneToOne: false
            referencedRelation: "association_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "chip_id_fkey"
            columns: ["chip_id"]
            isOneToOne: false
            referencedRelation: "v_problem_assets"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "v_problem_assets"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_logs: {
        Row: {
          client_id: string
          created_at: string
          date: string
          details: Json | null
          event_type: string
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_by: string | null
          performed_by_email: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date?: string
          details?: Json | null
          event_type: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          performed_by_email?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          details?: Json | null
          event_type?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_by?: string | null
          performed_by_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          cnpj: string | null
          contato: number
          created_at: string
          deleted_at: string | null
          email: string | null
          empresa: string
          nome: string
          responsavel: string
          telefones: Json | null
          updated_at: string
          uuid: string
        }
        Insert: {
          cnpj?: string | null
          contato: number
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          empresa: string
          nome: string
          responsavel: string
          telefones?: Json | null
          updated_at?: string
          uuid?: string
        }
        Update: {
          cnpj?: string | null
          contato?: number
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          empresa?: string
          nome?: string
          responsavel?: string
          telefones?: Json | null
          updated_at?: string
          uuid?: string
        }
        Relationships: []
      }
      location_types: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          client_id: string | null
          created_at: string | null
          deleted_at: string | null
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
          deleted_at?: string | null
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
          deleted_at?: string | null
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
          deleted_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      operation_locks: {
        Row: {
          acquired_at: string
          created_at: string
          expires_at: string
          id: string
          operation_data: Json | null
          operation_type: string
          resource_id: string
          user_id: string | null
        }
        Insert: {
          acquired_at?: string
          created_at?: string
          expires_at?: string
          id?: string
          operation_data?: Json | null
          operation_type: string
          resource_id: string
          user_id?: string | null
        }
        Update: {
          acquired_at?: string
          created_at?: string
          expires_at?: string
          id?: string
          operation_data?: Json | null
          operation_type?: string
          resource_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: number
          nome: string
          tamanho_gb: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          nome: string
          tamanho_gb?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: number
          nome?: string
          tamanho_gb?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profile_logs: {
        Row: {
          changed_at: string
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          changed_at?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          changed_at?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          last_login: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_active_clients: {
        Row: {
          client_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["uuid"]
          },
        ]
      }
      v_problem_assets: {
        Row: {
          line_number: number | null
          radio: string | null
          solution_id: number | null
          status_id: number | null
          status_name: string | null
          uuid: string | null
        }
        Relationships: [
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
        ]
      }
    }
    Functions: {
      acquire_operation_lock: {
        Args: {
          p_operation_type: string
          p_resource_id: string
          p_operation_data?: Json
          p_timeout_minutes?: number
        }
        Returns: Json
      }
      admin_delete_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      admin_list_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          role: Database["public"]["Enums"]["user_role_enum"]
          is_active: boolean
          is_approved: boolean
          created_at: string
          last_login: string
        }[]
      }
      admin_update_user_profile: {
        Args: { user_id: string; profile_updates: Json }
        Returns: boolean
      }
      admin_update_user_role: {
        Args: {
          user_id: string
          new_role: Database["public"]["Enums"]["user_role_enum"]
        }
        Returns: boolean
      }
      cleanup_expired_locks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      detect_association_inconsistencies: {
        Args: Record<PropertyKey, never>
        Returns: {
          asset_id: string
          current_status_id: number
          expected_status_id: number
          issue_description: string
          corrected: boolean
        }[]
      }
      has_minimum_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role_enum"] }
        Returns: boolean
      }
      has_role: {
        Args: { role_name: Database["public"]["Enums"]["user_role_enum"] }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_afiliado: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_support_or_above: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_self: {
        Args: { profile_id: string }
        Returns: boolean
      }
      release_operation_lock: {
        Args: { p_lock_id: string }
        Returns: boolean
      }
      status_by_asset_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          type: string
          status: string
          count: number
        }[]
      }
      update_all_rented_days: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_asset_rented_days: {
        Args: { asset_uuid: string }
        Returns: Json
      }
      update_asset_status: {
        Args: { asset_id: string; new_status_id: number }
        Returns: undefined
      }
      update_asset_status_by_association: {
        Args: { asset_id: string; association_type_id: number }
        Returns: undefined
      }
      user_has_profile: {
        Args: { user_id: string }
        Returns: boolean
      }
      validate_rented_days_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          asset_id: string
          current_rented_days: number
          calculated_days: number
          is_consistent: boolean
          message: string
        }[]
      }
    }
    Enums: {
      asset_status_enum:
        | "Dispon├¡vel"
        | "Alugado"
        | "Assinatura"
        | "Sem Dados"
        | "Bloqueado"
        | "Manuten├º├úo"
      asset_type_enum: "chip" | "equipment"
      association_type_enum: "aluguel" | "assinatura"
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
        | "LIVE"
      user_role_enum: "admin" | "suporte" | "cliente" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      asset_status_enum: [
        "Dispon├¡vel",
        "Alugado",
        "Assinatura",
        "Sem Dados",
        "Bloqueado",
        "Manuten├º├úo",
      ],
      asset_type_enum: ["chip", "equipment"],
      association_type_enum: ["aluguel", "assinatura"],
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
        "LIVE",
      ],
      user_role_enum: ["admin", "suporte", "cliente", "user"],
    },
  },
} as const
