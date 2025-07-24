-- Drop triggers on asset_client_assoc table
DROP TRIGGER IF EXISTS asset_client_assoc_log_trigger ON public.asset_client_assoc;
DROP TRIGGER IF EXISTS asset_client_assoc_status_log_trigger ON public.asset_client_assoc;
DROP TRIGGER IF EXISTS check_availability_before_association ON public.asset_client_assoc;
DROP TRIGGER IF EXISTS log_and_update_status_on_status_change ON public.asset_client_assoc;
DROP TRIGGER IF EXISTS prevent_rented_association_before ON public.asset_client_assoc;
DROP TRIGGER IF EXISTS set_asset_client_assoc_updated_at ON public.asset_client_assoc;
DROP TRIGGER IF EXISTS validate_active_uuid_on_change ON public.asset_client_assoc;

DROP FUNCTION IF EXISTS admin_list_users CASCADE;
DROP FUNCTION IF EXISTS admin_update_user_profile CASCADE;
DROP FUNCTION IF EXISTS admin_update_user_role CASCADE;
DROP FUNCTION IF EXISTS check_association_assets CASCADE;

-- Drop related functions
DROP FUNCTION IF EXISTS public.prevent_rented_association() CASCADE;
DROP FUNCTION IF EXISTS public.validate_active_uuid() CASCADE;