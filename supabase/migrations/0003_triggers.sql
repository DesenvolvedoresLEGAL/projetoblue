-- TRIGGERS

create trigger set_association_types_updated_at BEFORE update on association_types for EACH row execute FUNCTION set_updated_at ();
create trigger set_location_types_updated_at BEFORE update on location_types for EACH row execute FUNCTION set_updated_at ();

-- asset_client_assoc triggers
create trigger asset_client_assoc_log_trigger after INSERT or DELETE or update on asset_client_assoc for EACH row execute FUNCTION log_profile_change ();
create trigger asset_client_assoc_status_log_trigger after INSERT or DELETE or update on asset_client_assoc for EACH row execute FUNCTION log_and_update_status ();
create trigger check_availability_before_association BEFORE INSERT or update on asset_client_assoc for EACH row execute FUNCTION check_asset_availability ();
create trigger log_and_update_status_on_status_change after INSERT or update on asset_client_assoc for EACH row execute FUNCTION log_and_update_status ();
create trigger prevent_rented_association_before BEFORE INSERT on asset_client_assoc for EACH row execute FUNCTION prevent_rented_association ();
create trigger set_asset_client_assoc_updated_at BEFORE update on asset_client_assoc for EACH row execute FUNCTION set_updated_at ();
create trigger validate_active_uuid_on_change BEFORE INSERT or update on asset_client_assoc for EACH row execute FUNCTION validate_active_uuid ();

-- asset_logs triggers
create trigger asset_histories_log_trigger after INSERT or update on asset_logs for EACH row execute FUNCTION log_profile_change ();
create trigger asset_histories_log_trigger_before_delete BEFORE DELETE on asset_logs for EACH row execute FUNCTION log_profile_change ();
create trigger set_asset_logs_updated_at BEFORE update on asset_logs for EACH row execute FUNCTION set_updated_at ();

-- asset_solutions triggers
create trigger set_asset_solutions_updated_at BEFORE update on asset_solutions for EACH row execute FUNCTION set_updated_at ();

-- asset_status triggers
create trigger set_asset_status_updated_at BEFORE update on asset_status for EACH row execute FUNCTION set_updated_at ();

-- assets triggers
create trigger asset_status_update_history after update OF status_id on assets for EACH row execute FUNCTION log_asset_status_change ();
create trigger assets_after_insert after INSERT on assets for EACH row execute FUNCTION log_asset_insert ();
create trigger assets_log_trigger after INSERT or DELETE or update on assets for EACH row execute FUNCTION log_profile_change ();
create trigger set_assets_updated_at BEFORE update on assets for EACH row execute FUNCTION set_updated_at ();
create trigger trg_log_asset_soft_delete after update on assets for EACH row when ( old.deleted_at is null and new.deleted_at is not null ) execute FUNCTION log_asset_soft_delete ();

-- client_logs triggers
create trigger client_logs_updated_at_trigger BEFORE update on client_logs for EACH row execute FUNCTION update_generic_updated_at_column ();

-- clients triggers
create trigger client_changes_trigger after INSERT or DELETE or update on clients for EACH row execute FUNCTION log_client_changes ();
create trigger clients_log_trigger after INSERT or DELETE or update on clients for EACH row execute FUNCTION log_profile_change ();
create trigger set_clients_updated_at BEFORE update on clients for EACH row execute FUNCTION set_updated_at ();

-- locations triggers
create trigger set_locations_updated_at BEFORE update on locations for EACH row execute FUNCTION set_updated_at ();
create trigger update_locations_updated_at BEFORE update on locations for EACH row execute FUNCTION update_generic_updated_at_column ();

-- manufacturers triggers
create trigger set_manufacturers_updated_at BEFORE update on manufacturers for EACH row execute FUNCTION set_updated_at ();
create trigger update_manufacturer_updated_at BEFORE update on manufacturers for EACH row execute FUNCTION update_generic_updated_at_column ();

-- operation_locks triggers (nenhum no original)

-- plans triggers
create trigger plans_log_trigger after INSERT or DELETE or update on plans for EACH row execute FUNCTION log_profile_change ();
create trigger set_plans_updated_at BEFORE update on plans for EACH row execute FUNCTION set_updated_at ();

-- profile_logs triggers
create trigger set_profile_logs_updated_at BEFORE update on profile_logs for EACH row execute FUNCTION set_updated_at ();

-- profiles triggers
create trigger profiles_log_trigger after INSERT or DELETE or update on profiles for EACH row execute FUNCTION log_profile_change ();
create trigger set_profiles_updated_at BEFORE update on profiles for EACH row execute FUNCTION set_updated_at ();

-- 5. VIEWS

create view public.v_problem_assets as
select
  a.uuid,
  a.solution_id,
  a.line_number,
  a.radio,
  s.status as status_name,
  a.status_id
from
  assets a
  join asset_status s on a.status_id = s.id
where
  s.id > 3;

create view public.v_active_clients as
select distinct
  asset_client_assoc.client_id
from
  asset_client_assoc
where
  asset_client_assoc.exit_date is null
  or asset_client_assoc.exit_date > now();
