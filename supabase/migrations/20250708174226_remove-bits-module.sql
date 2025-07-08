DO $$
BEGIN

-- bits_user_badges
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_user_badges') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_user_badges_updated_at ON public.bits_user_badges';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own earned badges" ON public.bits_user_badges';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_user_badges';
END IF;

-- bits_user_missions
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_user_missions') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_user_missions_updated_at ON public.bits_user_missions';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update their own mission progress" ON public.bits_user_missions';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own missions" ON public.bits_user_missions';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_user_missions';
END IF;

-- bits_user_profile_stats
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_user_profile_stats') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_user_profile_stats_updated_at ON public.bits_user_profile_stats';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view their own profile stats" ON public.bits_user_profile_stats';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_user_profile_stats';
END IF;

-- bits_user_rewards
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_user_rewards') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_user_rewards_updated_at ON public.bits_user_rewards';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all user rewards" ON public.bits_user_rewards';
  EXECUTE 'DROP POLICY IF EXISTS "Afiliados can manage their own redeemed rewards" ON public.bits_user_rewards';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_user_rewards';
END IF;

-- bits_points_log
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_points_log') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_points_log_updated_at ON public.bits_points_log';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all points logs" ON public.bits_points_log';
  EXECUTE 'DROP POLICY IF EXISTS "Afiliados can view their own points log" ON public.bits_points_log';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_points_log';
END IF;

-- bits_referrals
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_referrals') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS handle_bits_referrals_updated_at ON public.bits_referrals';
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_referrals_updated_at ON public.bits_referrals';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can do everything with referrals" ON public.bits_referrals';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all referrals" ON public.bits_referrals';
  EXECUTE 'DROP POLICY IF EXISTS "Afiliados can manage their own referrals" ON public.bits_referrals';
  EXECUTE 'DROP POLICY IF EXISTS "Clientes can create referrals" ON public.bits_referrals';
  EXECUTE 'DROP POLICY IF EXISTS "Clientes can view their own referrals" ON public.bits_referrals';
  EXECUTE 'DROP POLICY IF EXISTS "Suporte can manage all referrals" ON public.bits_referrals';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_referrals';
END IF;

-- bits_missions_catalog
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_missions_catalog') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_missions_catalog_updated_at ON public.bits_missions_catalog';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read missions catalog" ON public.bits_missions_catalog';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_missions_catalog';
END IF;

-- bits_rewards_catalog
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_rewards_catalog') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS handle_bits_rewards_catalog_updated_at ON public.bits_rewards_catalog';
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_rewards_catalog_updated_at ON public.bits_rewards_catalog';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage rewards catalog" ON public.bits_rewards_catalog';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view rewards catalog" ON public.bits_rewards_catalog';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_rewards_catalog';
END IF;

-- bits_badges_catalog
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_badges_catalog') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_badges_catalog_updated_at ON public.bits_badges_catalog';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read badges catalog" ON public.bits_badges_catalog';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_badges_catalog';
END IF;

-- bits_campaigns
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_campaigns') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_campaigns_updated_at ON public.bits_campaigns';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read active campaigns" ON public.bits_campaigns';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_campaigns';
END IF;

-- bits_levels_catalog
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bits_levels_catalog') THEN
  EXECUTE 'DROP TRIGGER IF EXISTS set_bits_levels_catalog_updated_at ON public.bits_levels_catalog';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read levels catalog" ON public.bits_levels_catalog';
  EXECUTE 'DROP TABLE IF EXISTS public.bits_levels_catalog';
END IF;

-- Drop types (direto, pois não faz erro se não existe)
EXECUTE 'DROP TYPE IF EXISTS public.bits_mission_status_enum';
EXECUTE 'DROP TYPE IF EXISTS public.bits_referral_status_enum';

-- Remove column from profiles
IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bits_referral_code'
) THEN
  EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_bits_referral_code_key';
  EXECUTE 'ALTER TABLE public.profiles DROP COLUMN IF EXISTS bits_referral_code';
END IF;

END$$;
