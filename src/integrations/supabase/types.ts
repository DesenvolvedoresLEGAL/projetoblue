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
      bits_badges_catalog: {
        Row: {
          created_at: string
          criteria: Json | null
          description: string | null
          icon_url: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      bits_campaigns: {
        Row: {
          applicable_to: Json | null
          bonus_points: number | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          point_multiplier: number | null
          start_date: string
          updated_at: string
        }
        Insert: {
          applicable_to?: Json | null
          bonus_points?: number | null
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          point_multiplier?: number | null
          start_date: string
          updated_at?: string
        }
        Update: {
          applicable_to?: Json | null
          bonus_points?: number | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          point_multiplier?: number | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      bits_levels_catalog: {
        Row: {
          benefits: Json | null
          created_at: string
          level_number: number
          name: string
          points_required: number
          updated_at: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string
          level_number: number
          name: string
          points_required: number
          updated_at?: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string
          level_number?: number
          name?: string
          points_required?: number
          updated_at?: string
        }
        Relationships: []
      }
      bits_missions_catalog: {
        Row: {
          badge_reward_id: string | null
          created_at: string
          criteria: Json | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          points_reward: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          badge_reward_id?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_reward?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          badge_reward_id?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_reward?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bits_missions_catalog_badge_reward_id_fkey"
            columns: ["badge_reward_id"]
            isOneToOne: false
            referencedRelation: "bits_badges_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      bits_points_log: {
        Row: {
          action_type: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          points: number
          related_referral_id: string | null
          related_reward_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          points: number
          related_referral_id?: string | null
          related_reward_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          points?: number
          related_referral_id?: string | null
          related_reward_id?: string | null
          updated_at?: string
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
          conversion_data: Json | null
          created_at: string | null
          deleted_at: string | null
          id: string
          piperun_deal_status: string | null
          piperun_lead_id: string | null
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
          conversion_data?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          piperun_deal_status?: string | null
          piperun_lead_id?: string | null
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
          conversion_data?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          piperun_deal_status?: string | null
          piperun_lead_id?: string | null
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
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_required: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_required: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_required?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      bits_user_badges: {
        Row: {
          badge_id: string
          created_at: string
          earned_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          earned_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          earned_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bits_user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "bits_badges_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bits_user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bits_user_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string
          progress: Json | null
          status: Database["public"]["Enums"]["bits_mission_status_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id: string
          progress?: Json | null
          status?: Database["public"]["Enums"]["bits_mission_status_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          progress?: Json | null
          status?: Database["public"]["Enums"]["bits_mission_status_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bits_user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "bits_missions_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bits_user_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bits_user_profile_stats: {
        Row: {
          created_at: string
          current_level_number: number
          current_points_balance: number
          last_points_activity_at: string | null
          total_points_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level_number?: number
          current_points_balance?: number
          last_points_activity_at?: string | null
          total_points_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level_number?: number
          current_points_balance?: number
          last_points_activity_at?: string | null
          total_points_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bits_user_profile_stats_current_level_number_fkey"
            columns: ["current_level_number"]
            isOneToOne: false
            referencedRelation: "bits_levels_catalog"
            referencedColumns: ["level_number"]
          },
          {
            foreignKeyName: "bits_user_profile_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bits_user_rewards: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          points_spent: number
          redeemed_at: string | null
          reward_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          points_spent: number
          redeemed_at?: string | null
          reward_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          reward_id?: string
          updated_at?: string
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
          bits_referral_code: string | null
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          last_login: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
        }
        Insert: {
          bits_referral_code?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
        }
        Update: {
          bits_referral_code?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
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
            foreignKeyName: "asset_client_assoc_client_id_fkey"
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
      ensure_user_profile: {
        Args: {
          user_id: string
          user_email: string
          user_role?: Database["public"]["Enums"]["user_role_enum"]
        }
        Returns: boolean
      }
      fix_missing_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          fixed: boolean
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
      status_by_asset_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          type: string
          status: string
          count: number
        }[]
      }
      update_user_role: {
        Args: {
          user_email: string
          new_role: Database["public"]["Enums"]["user_role_enum"]
        }
        Returns: boolean
      }
      user_has_profile: {
        Args: { user_id: string }
        Returns: boolean
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
      bits_mission_status_enum: "in_progress" | "completed" | "expired"
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
      user_role_enum:
        | "admin"
        | "gestor"
        | "consultor"
        | "cliente"
        | "user"
        | "suporte"
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
      bits_mission_status_enum: ["in_progress", "completed", "expired"],
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
      user_role_enum: [
        "admin",
        "gestor",
        "consultor",
        "cliente",
        "user",
        "suporte",
      ],
    },
  },
} as const
