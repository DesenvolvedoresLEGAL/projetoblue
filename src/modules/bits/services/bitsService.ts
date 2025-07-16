import { supabase } from "@/integrations/supabase/client";
import { 
  Referral, 
  PointTransaction, 
  Reward, 
  UserReward, 
  Badge, 
  UserBadge,
  UserProfileStats,
  Campaign,
  Mission,
  UserMission,
  Level
} from "../types";
import { toast } from "@/utils/toast";
import { UserRole } from "@/types/auth";

// Utility function to handle errors
const handleError = (error: Error, message: string) => {
  if (import.meta.env.DEV) console.error(`BITS Error: ${message}`, error);
  toast.error(message);
  throw error;
};

// Referrals
export const referralService = {
  // Get referrals for the current user
  async getUserReferrals(): Promise<Referral[]> {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('bits_referrals')
        .select('*')
        .eq('referrer_user_id', userAuth.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch referrals");
      return [];
    }
  },

  // Create a new referral
  async createReferral(referralData: Omit<Referral, 'id' | 'referrer_user_id' | 'status' | 'points_earned' | 'created_at' | 'updated_at'>): Promise<Referral | null> {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('bits_referrals')
        .insert({
          ...referralData,
          referrer_user_id: userAuth.user.id,
          status: 'pendente',
          points_earned: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error as Error, "Failed to create referral");
      return null;
    }
  },

  // Get referral by ID
  async getReferralById(id: string): Promise<Referral | null> {
    try {
      const { data, error } = await supabase
        .from('bits_referrals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error as Error, "Failed to fetch referral");
      return null;
    }
  }
};

// Points
export const pointsService = {
  // Get user's point transactions
  async getPointTransactions(): Promise<PointTransaction[]> {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('bits_points_log')
        .select('*')
        .eq('user_id', userAuth.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch point transactions");
      return [];
    }
  },

  // Get user's points stats
  async getUserStats(): Promise<UserProfileStats | null> {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('bits_user_profile_stats')
        .select('*')
        .eq('user_id', userAuth.user.id)
        .single();
      
      if (error) {
        // If the user doesn't have stats yet, return default values
        if (error.code === 'PGRST116') {
          return {
            user_id: userAuth.user.id,
            current_points_balance: 0,
            total_points_earned: 0,
            current_level_number: 1
          };
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      handleError(error as Error, "Failed to fetch user stats");
      return null;
    }
  }
};

// Rewards
export const rewardsService = {
  // Get all available rewards
  async getAvailableRewards(): Promise<Reward[]> {
    try {
      const { data, error } = await supabase
        .from('bits_rewards_catalog')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch rewards");
      return [];
    }
  },

  // Get user's redeemed rewards
  async getUserRewards(): Promise<UserReward[]> {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('bits_user_rewards')
        .select('*, bits_rewards_catalog(*)')
        .eq('user_id', userAuth.user.id)
        .order('redeemed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch user rewards");
      return [];
    }
  },

  // Redeem a reward
  async redeemReward(rewardId: string): Promise<UserReward | null> {
    try {
      // Get user stats to check if they have enough points
      const stats = await pointsService.getUserStats();
      if (!stats) throw new Error("Could not get user stats");
      
      // Get reward details to check points required
      const { data: reward, error: rewardError } = await supabase
        .from('bits_rewards_catalog')
        .select('*')
        .eq('id', rewardId)
        .single();
      
      if (rewardError) throw rewardError;
      
      if (!reward) throw new Error("Reward not found");
      if (!reward.is_active) throw new Error("Reward is not active");
      if (stats.current_points_balance < reward.points_required) {
        throw new Error("Not enough points to redeem this reward");
      }
      
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      // Start a transaction using RPC (would require a custom function in Supabase)
      // For now, we'll do it in sequence
      
      // 1. Create the user reward
      const { data: userReward, error: redemptionError } = await supabase
        .from('bits_user_rewards')
        .insert({
          user_id: userAuth.user.id,
          reward_id: rewardId,
          points_spent: reward.points_required
        })
        .select()
        .single();
      
      if (redemptionError) throw redemptionError;
      
      // 2. Record the points transaction
      const { error: pointsError } = await supabase
        .from('bits_points_log')
        .insert({
          user_id: userAuth.user.id,
          points: -reward.points_required,
          action_type: 'reward_redemption',
          description: `Resgaste: ${reward.name}`,
          related_reward_id: rewardId
        });
      
      if (pointsError) throw pointsError;
      
      return userReward;
    } catch (error) {
      handleError(error as Error, "Failed to redeem reward");
      return null;
    }
  }
};

// Badges
export const badgesService = {
  // Get all badges
  async getAllBadges(): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('bits_badges_catalog')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch badges");
      return [];
    }
  },

  // Get user's badges
  async getUserBadges(): Promise<UserBadge[]> {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('bits_user_badges')
        .select('*, bits_badges_catalog(*)')
        .eq('user_id', userAuth.user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch user badges");
      return [];
    }
  }
};

// Campaigns
export const campaignService = {
  // Get active campaigns
  async getActiveCampaigns(): Promise<Campaign[]> {
    try {
      const today = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('bits_campaigns')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch active campaigns");
      return [];
    }
  }
};

// Missions
export const missionService = {
  // Get active missions
  async getActiveMissions(): Promise<Mission[]> {
    try {
      const today = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('bits_missions_catalog')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch active missions");
      return [];
    }
  },

  // Get user's missions
  async getUserMissions(): Promise<UserMission[]> {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('bits_user_missions')
        .select('*, bits_missions_catalog(*)')
        .eq('user_id', userAuth.user.id);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch user missions");
      return [];
    }
  }
};

// Levels
export const levelService = {
  // Get all levels
  async getAllLevels(): Promise<Level[]> {
    try {
      const { data, error } = await supabase
        .from('bits_levels_catalog')
        .select('*')
        .order('level_number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error as Error, "Failed to fetch levels");
      return [];
    }
  },

  // Get user current level
  async getUserLevel(): Promise<Level | null> {
    try {
      const stats = await pointsService.getUserStats();
      if (!stats) return null;
      
      const { data, error } = await supabase
        .from('bits_levels_catalog')
        .select('*')
        .eq('level_number', stats.current_level_number)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error as Error, "Failed to fetch user level");
      return null;
    }
  },

  // Get next level
  async getNextLevel(): Promise<Level | null> {
    try {
      const stats = await pointsService.getUserStats();
      if (!stats) return null;
      
      const { data, error } = await supabase
        .from('bits_levels_catalog')
        .select('*')
        .gt('level_number', stats.current_level_number)
        .order('level_number', { ascending: true })
        .limit(1)
        .single();
      
      if (error) {
        // If no next level (user at max level), this will error
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      return data;
    } catch (error) {
      handleError(error as Error, "Failed to fetch next level");
      return null;
    }
  }
};

// Profile Service
export const bitsProfileService = {
  // Get user's BITS profile info (including referral code)
  async getUserBitsProfile() {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userAuth.user.id)
        .single();
      
      if (error) throw error;
      
      // Get user stats
      const stats = await pointsService.getUserStats();
      
      return {
        ...data,
        stats
      };
    } catch (error) {
      handleError(error as Error, "Failed to fetch BITS profile");
      return null;
    }
  },

  // Generate referral code for user if they don't have one
  async generateReferralCode() {
    try {
      const { data: userAuth } = await supabase.auth.getUser();
      if (!userAuth.user) throw new Error("User not authenticated");
      
      // Check if user already has a code
      const { data: profile } = await supabase
        .from('profiles')
        .select('bits_referral_code, role')
        .eq('id', userAuth.user.id)
        .single();
      
      if (profile?.bits_referral_code) {
        return profile.bits_referral_code;
      }
      
      // Only generate codes for cliente or higher roles (including suporte)
      const role = profile?.role as UserRole;
      if (role !== 'cliente' && role !== 'suporte' && role !== 'admin') {
        throw new Error("Only 'cliente' or higher roles can generate referral codes");
      }
      
      // Generate a new code (username + random 6 chars)
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const username = userAuth.user.email?.split('@')[0] || '';
      const code = `${username.substring(0, 5)}${randomPart}`.toUpperCase();
      
      const { error } = await supabase
        .from('profiles')
        .update({ bits_referral_code: code })
        .eq('id', userAuth.user.id);
      
      if (error) throw error;
      
      return code;
    } catch (error) {
      handleError(error as Error, "Failed to generate referral code");
      return null;
    }
  }
};

// Combined service export
export const bitsService = {
  referral: referralService,
  points: pointsService,
  rewards: rewardsService,
  badges: badgesService,
  campaigns: campaignService,
  missions: missionService,
  levels: levelService,
  profile: bitsProfileService
};
