SELECT 'alter function public.' || proname || '(' ||
       pg_get_function_identity_arguments(p.oid) ||
       ') set search_path = ''public'';'
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
ORDER BY proname;
alter function public.user_has_profile set search_path = 'public';
alter function public.admin_delete_user set search_path = 'public';
alter function public.detect_association_inconsistencies set search_path = 'public';
alter function public.has_role set search_path = 'public';
alter function public.set_updated_at set search_path = 'public';
alter function public.prevent_rented_association set search_path = 'public';
alter function public.handle_new_user set search_path = 'public';
alter function public.is_support_or_above set search_path = 'public';
alter function public.is_user_self set search_path = 'public';
alter function public.log_asset_insert set search_path = 'public';
alter function public.log_asset_soft_delete set search_path = 'public';
alter function public.log_client_changes set search_path = 'public';
alter function public.update_generic_updated_at_column set search_path = 'public';
alter function public.has_minimum_role set search_path = 'public';
alter function public.check_asset_availability set search_path = 'public';
alter function public.log_profile_change set search_path = 'public';
alter function public.status_by_asset_type set search_path = 'public';
alter function public.update_all_rented_days set search_path = 'public';
alter function public.update_asset_rented_days set search_path = 'public';
alter function public.is_admin set search_path = 'public';
alter function public.update_profile_last_login set search_path = 'public';
alter function public.log_and_update_status set search_path = 'public';
alter function public.is_afiliado set search_path = 'public';
alter function public.validate_rented_days_integrity set search_path = 'public';
