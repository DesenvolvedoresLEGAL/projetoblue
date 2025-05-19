
import { UserProfile } from '@/types/auth';

// Referral status enum matching the database enum type
export type ReferralStatus = 'pendente' | 'aprovada' | 'rejeitada' | 'convertida';

// Mission status enum matching the database enum type
export type MissionStatus = 'in_progress' | 'completed' | 'failed';

// Referral interface based on bits_referrals table
export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_name: string;
  referred_email: string;
  referred_phone?: string;
  referred_company?: string;
  status: ReferralStatus;
  points_earned: number;
  created_at: string;
  updated_at: string;
  referral_link_used?: string;
  piperun_lead_id?: string;
  piperun_deal_status?: string;
  conversion_data?: any;
}

// Point transaction interface based on bits_points_log table
export interface PointTransaction {
  id: string;
  user_id: string;
  points: number;
  action_type: string;
  description?: string;
  related_referral_id?: string;
  related_reward_id?: string;
  created_at: string;
}

// Reward interface based on bits_rewards_catalog table
export interface Reward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  is_active: boolean;
  created_at: string;
}

// User reward interface based on bits_user_rewards table
export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  redeemed_at: string;
}

// Badge interface based on bits_badges_catalog table
export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  criteria?: any;
  created_at: string;
}

// User badge interface based on bits_user_badges table
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

// Campaign interface based on bits_campaigns table
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  point_multiplier?: number;
  bonus_points?: number;
  applicable_to?: any;
}

// User profile stats interface based on bits_user_profile_stats table
export interface UserProfileStats {
  user_id: string;
  current_points_balance: number;
  total_points_earned: number;
  current_level_number: number;
  last_points_activity_at?: string;
}

// Mission interface based on bits_missions_catalog table
export interface Mission {
  id: string;
  name: string;
  description?: string;
  points_reward: number;
  badge_reward_id?: string;
  criteria?: any;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
}

// User mission interface based on bits_user_missions table
export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  status: MissionStatus;
  progress?: any;
  completed_at?: string;
}

// Level interface based on bits_levels_catalog table
export interface Level {
  level_number: number;
  name: string;
  points_required: number;
  benefits?: any;
}

// Extended profile interface for BITS functionality
export interface BitsProfile extends UserProfile {
  bits_referral_code?: string;
  stats?: UserProfileStats;
}
