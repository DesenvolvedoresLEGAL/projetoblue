-- Migration to remove BITS module tables, types, triggers, and policies

-- Drop triggers
DROP TRIGGER IF EXISTS handle_bits_referrals_updated_at ON public.bits_referrals;
DROP TRIGGER IF EXISTS handle_bits_rewards_catalog_updated_at ON public.bits_rewards_catalog;
DROP TRIGGER IF EXISTS set_bits_badges_catalog_updated_at ON public.bits_badges_catalog;
DROP TRIGGER IF EXISTS set_bits_campaigns_updated_at ON public.bits_campaigns;
DROP TRIGGER IF EXISTS set_bits_levels_catalog_updated_at ON public.bits_levels_catalog;
DROP TRIGGER IF EXISTS set_bits_missions_catalog_updated_at ON public.bits_missions_catalog;
DROP TRIGGER IF EXISTS set_bits_points_log_updated_at ON public.bits_points_log;
DROP TRIGGER IF EXISTS set_bits_referrals_updated_at ON public.bits_referrals;
DROP TRIGGER IF EXISTS set_bits_rewards_catalog_updated_at ON public.bits_rewards_catalog;
DROP TRIGGER IF EXISTS set_bits_user_badges_updated_at ON public.bits_user_badges;
DROP TRIGGER IF EXISTS set_bits_user_missions_updated_at ON public.bits_user_missions;
DROP TRIGGER IF EXISTS set_bits_user_profile_stats_updated_at ON public.bits_user_profile_stats;
DROP TRIGGER IF EXISTS set_bits_user_rewards_updated_at ON public.bits_user_rewards;

-- Drop RLS policies
DROP POLICY IF EXISTS "Admins can do everything with referrals" ON public.bits_referrals;
DROP POLICY IF EXISTS "Admins can manage all points logs" ON public.bits_points_log;
DROP POLICY IF EXISTS "Admins can manage all referrals" ON public.bits_referrals;
DROP POLICY IF EXISTS "Admins can manage all user rewards" ON public.bits_user_rewards;
DROP POLICY IF EXISTS "Admins can manage rewards catalog" ON public.bits_rewards_catalog;
DROP POLICY IF EXISTS "Afiliados can manage their own redeemed rewards" ON public.bits_user_rewards;
DROP POLICY IF EXISTS "Afiliados can manage their own referrals" ON public.bits_referrals;
DROP POLICY IF EXISTS "Afiliados can view their own points log" ON public.bits_points_log;
DROP POLICY IF EXISTS "Authenticated users can read active campaigns" ON public.bits_campaigns;
DROP POLICY IF EXISTS "Authenticated users can read badges catalog" ON public.bits_badges_catalog;
DROP POLICY IF EXISTS "Authenticated users can read levels catalog" ON public.bits_levels_catalog;
DROP POLICY IF EXISTS "Authenticated users can read missions catalog" ON public.bits_missions_catalog;
DROP POLICY IF EXISTS "Authenticated users can view rewards catalog" ON public.bits_rewards_catalog;
DROP POLICY IF EXISTS "Clientes can create referrals" ON public.bits_referrals;
DROP POLICY IF EXISTS "Clientes can view their own referrals" ON public.bits_referrals;
DROP POLICY IF EXISTS "Suporte can manage all referrals" ON public.bits_referrals;
DROP POLICY IF EXISTS "Users can update their own mission progress" ON public.bits_user_missions;
DROP POLICY IF EXISTS "Users can view their own earned badges" ON public.bits_user_badges;
DROP POLICY IF EXISTS "Users can view their own missions" ON public.bits_user_missions;
DROP POLICY IF EXISTS "Users can view their own profile stats" ON public.bits_user_profile_stats;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.bits_user_badges;
DROP TABLE IF EXISTS public.bits_user_missions;
DROP TABLE IF EXISTS public.bits_user_profile_stats;
DROP TABLE IF EXISTS public.bits_user_rewards;
DROP TABLE IF EXISTS public.bits_points_log;
DROP TABLE IF EXISTS public.bits_referrals;
DROP TABLE IF EXISTS public.bits_missions_catalog;
DROP TABLE IF EXISTS public.bits_rewards_catalog;
DROP TABLE IF EXISTS public.bits_badges_catalog;
DROP TABLE IF EXISTS public.bits_campaigns;
DROP TABLE IF EXISTS public.bits_levels_catalog;

-- Drop types
DROP TYPE IF EXISTS public.bits_mission_status_enum;
DROP TYPE IF EXISTS public.bits_referral_status_enum;

-- Remove column from profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bits_referral_code_key;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS bits_referral_code;