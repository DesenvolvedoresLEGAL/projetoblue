-- Ensure associations table exists before dropping triggers/functions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'associations') THEN
        CREATE TABLE IF NOT EXISTS associations (
  uuid text not null default gen_random_uuid (),
  client_id text not null,
  equipment_id text null,
  chip_id text null,
  entry_date date not null,
  exit_date date null,
  association_type_id bigint not null,
  plan_id bigint null,
  plan_gb bigint null default '0'::bigint,
  equipment_ssid text null,
  equipment_pass text null,
  status boolean not null default TRUE, -- status como um booleano sendo false - encerrado - e true - ativo.
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone null,
  constraint associations_pkey primary key (uuid),
  constraint client_id_fkey foreign key (client_id) references clients(uuid),
  constraint equipment_id_fkey foreign key (equipment_id) references assets(uuid),
  constraint chip_id_fkey foreign key (chip_id) references assets(uuid),
  constraint association_type_id_fkey foreign key (association_type_id) references association_types(id),
  constraint plan_id_fkey foreign key (plan_id) references plans(id)
);

DROP INDEX IF EXISTS idx_associations_status_active;
DROP INDEX IF EXISTS idx_associations_client_id;
DROP INDEX IF EXISTS idx_associations_equipment_id;
DROP INDEX IF EXISTS idx_associations_chip_id;
DROP INDEX IF EXISTS idx_associations_entry_date;
DROP INDEX IF EXISTS idx_associations_exit_date;
DROP INDEX IF EXISTS idx_associations_plan_id;

CREATE INDEX IF NOT EXISTS idx_associations_status_active ON associations (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_associations_client_id ON associations (client_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_associations_equipment_id ON associations (equipment_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_associations_chip_id ON associations (chip_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_associations_entry_date ON associations (entry_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_associations_exit_date ON associations (exit_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_associations_plan_id ON associations (plan_id) WHERE deleted_at IS NULL;

ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can insert" ON public.associations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update" ON public.associations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable read access for all users" ON public.associations FOR SELECT USING (true);
CREATE POLICY "admin_total_access" ON public.associations TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION check_association_assets()
RETURNS TRIGGER AS $$
BEGIN
  -- Valida equipment_id: NÃO pode ser solution_id = 11
  IF NEW.equipment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM assets WHERE uuid = NEW.equipment_id AND solution_id = 11
  ) THEN
    RAISE EXCEPTION 'equipment_id não pode referenciar asset com solution_id = 11';
  END IF;

  -- Valida chip_id: SÓ pode ser solution_id = 11
  IF NEW.chip_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM assets WHERE uuid = NEW.chip_id AND solution_id <> 11
  ) THEN
    RAISE EXCEPTION 'chip_id não pode referenciar asset com solution_id diferente de 11';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

    END IF;
END $$;

-- Remove invalid IF/THEN block and RAISE EXCEPTION outside function
DROP TRIGGER IF EXISTS asset_status_update_history ON public.assets;
DROP FUNCTION IF EXISTS public.log_asset_status_change;
DROP FUNCTION IF EXISTS public.validate_association_state;
DROP TRIGGER IF EXISTS associations_log_trigger ON public.associations;
DROP TRIGGER IF EXISTS associations_status_log_trigger ON public.associations;
DROP TRIGGER IF EXISTS check_availability_before_association ON public.associations;
DROP TRIGGER IF EXISTS prevent_rented_association_before ON public.associations;
DROP TRIGGER IF EXISTS set_associations_updated_at ON public.associations;
-- Update functions and triggers to use associations table

-- check_asset_availability
CREATE OR REPLACE FUNCTION public.check_asset_availability()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SET search_path TO public;
  IF EXISTS (
    SELECT 1
    FROM public.associations a
    WHERE (
            (NEW.equipment_id IS NOT NULL AND a.equipment_id = NEW.equipment_id) OR
            (NEW.chip_id IS NOT NULL AND a.chip_id = NEW.chip_id)
          )
      AND a.uuid <> COALESCE(NEW.uuid, '00000000-0000-0000-0000-000000000000')
      AND NEW.entry_date < COALESCE(a.exit_date, 'infinity')
      AND COALESCE(NEW.exit_date, 'infinity') > a.entry_date
      AND a.status = TRUE
      AND a.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'O ativo % já está associado a outro cliente neste período.', COALESCE(NEW.equipment_id, NEW.chip_id);
  END IF;
  RETURN NEW;
END;
$$;


-- update_all_rented_days
CREATE OR REPLACE FUNCTION public.update_all_rented_days()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public, auth'
AS $$
DECLARE
    asset_record record;
    total_processed integer := 0;
    total_updated integer := 0;
    total_errors integer := 0;
    result jsonb;
BEGIN
    FOR asset_record IN (SELECT uuid FROM public.assets WHERE deleted_at IS NULL) LOOP
        result := public.update_asset_rented_days(asset_record.uuid);
        total_processed := total_processed + 1;
        IF result->>'success' = 'true' THEN
            IF (result->>'updated')::boolean THEN
                total_updated := total_updated + 1;
            END IF;
        ELSE
            total_errors := total_errors + 1;
        END IF;
    END LOOP;
    RETURN jsonb_build_object('success', true,'total_processed', total_processed,'total_updated', total_updated,'total_errors', total_errors,'execution_timestamp', NOW());
END;
$$;

CREATE OR REPLACE FUNCTION public.update_asset_rented_days("asset_uuid" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public, auth'
    AS $$
DECLARE
    current_rented_days integer := 0;
    calculated_days integer := 0;
    new_total_days integer := 0;
BEGIN
    -- verificar se o ativo existe
    IF NOT EXISTS (SELECT 1 FROM public.assets WHERE uuid = asset_uuid AND deleted_at IS NULL) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Asset not found',
            'asset_id', asset_uuid
        );
    END IF;

    -- valor historico
    SELECT COALESCE(rented_days,0) INTO current_rented_days
    FROM public.assets
    WHERE uuid = asset_uuid;

    -- dias calculados a partir das associacoes finalizadas
    SELECT COUNT(DISTINCT d)::integer INTO calculated_days
    FROM (
        SELECT generate_series(entry_date, exit_date, INTERVAL '1 day')::date AS d
        FROM public.associations
        WHERE asset_id = asset_uuid
          AND exit_date IS NOT NULL
          AND entry_date IS NOT NULL
          AND exit_date >= entry_date
          AND deleted_at IS NULL
    ) sub;

    new_total_days := current_rented_days + calculated_days;

    IF new_total_days >= current_rented_days THEN
        UPDATE public.assets
        SET rented_days = new_total_days,
            updated_at = NOW()
        WHERE uuid = asset_uuid;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'asset_id', asset_uuid,
        'historical_days', current_rented_days,
        'calculated_days', calculated_days,
        'total_days', new_total_days,
        'updated', new_total_days >= current_rented_days
    );
END;
$$;


-- validate_rented_days_integrity
CREATE OR REPLACE FUNCTION public.validate_rented_days_integrity()
RETURNS TABLE(asset_id text, current_rented_days integer, calculated_days integer, is_consistent boolean, message text)
LANGUAGE plpgsql
SET search_path TO 'public, auth'
AS $$
DECLARE
    asset_record RECORD;
    calculated_days integer;
BEGIN
    FOR asset_record IN SELECT uuid, rented_days FROM public.assets WHERE deleted_at IS NULL LOOP
        WITH periods AS (
            SELECT entry_date, exit_date
            FROM public.associations
            WHERE (equipment_id = asset_record.uuid OR chip_id = asset_record.uuid)
              AND exit_date IS NOT NULL
              AND deleted_at IS NULL
              AND entry_date IS NOT NULL
              AND exit_date >= entry_date
        ), merged AS (
            SELECT COALESCE(SUM(exit_date - entry_date + 1),0) AS total_days FROM periods
        )
        SELECT total_days INTO calculated_days FROM merged;
        asset_id := asset_record.uuid;
        current_rented_days := COALESCE(asset_record.rented_days,0);
        is_consistent := (current_rented_days >= calculated_days);
        message := CASE WHEN is_consistent THEN 'OK - Historical + Blue periods' ELSE 'INCONSISTENT - Current value less than calculated' END;
        RETURN NEXT;
    END LOOP;
END;
$$;

-- view update
CREATE OR REPLACE VIEW public.v_active_clients WITH (security_invoker='on') AS
 SELECT DISTINCT associations.client_id
   FROM public.associations
  WHERE associations.status = TRUE
    AND associations.deleted_at IS NULL;

-- recreate triggers on associations

CREATE OR REPLACE TRIGGER associations_log_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.associations
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_change();

CREATE OR REPLACE TRIGGER associations_status_log_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.associations
  FOR EACH ROW EXECUTE FUNCTION public.log_and_update_status();

CREATE OR REPLACE TRIGGER check_availability_before_association
  BEFORE INSERT OR UPDATE ON public.associations
  FOR EACH ROW EXECUTE FUNCTION public.check_asset_availability();

CREATE OR REPLACE TRIGGER prevent_rented_association_before
  BEFORE INSERT ON public.associations
  FOR EACH ROW EXECUTE FUNCTION public.prevent_rented_association();

CREATE OR REPLACE TRIGGER set_associations_updated_at
  BEFORE UPDATE ON public.associations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();