BEGIN;

-- Drop triggers on old asset_logs table
DROP TRIGGER IF EXISTS asset_histories_log_trigger ON public.asset_logs;
DROP TRIGGER IF EXISTS asset_histories_log_trigger_before_delete ON public.asset_logs;
DROP TRIGGER IF EXISTS set_asset_logs_updated_at ON public.asset_logs;

-- Rename existing table to keep historical data
ALTER TABLE public.asset_logs RENAME TO asset_logs_legacy;

-- Ensure sequence ownership follows the renamed table
ALTER SEQUENCE IF EXISTS public.asset_history_id_seq OWNED BY public.asset_logs_legacy.id;

-- Create association_logs table
CREATE TABLE public.association_logs (
    uuid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id),
    association_uuid uuid NOT NULL REFERENCES associations(uuid),
    event text NOT NULL,
    details jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TRIGGER set_association_logs_updated_at
BEFORE UPDATE ON public.association_logs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_association_logs_association_uuid ON public.association_logs(association_uuid);
CREATE INDEX idx_association_logs_user_id ON public.association_logs(user_id);
CREATE INDEX idx_association_logs_deleted_at ON public.association_logs(deleted_at);

ALTER TABLE public.association_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can insert" ON public.association_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update" ON public.association_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable read access for all users" ON public.association_logs FOR SELECT USING (true);
CREATE POLICY "admin_total_access" ON public.association_logs TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Create new asset_logs table using UUIDs
CREATE TABLE public.asset_logs (
    uuid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES profiles(id),
    asset_id uuid NOT NULL REFERENCES assets(uuid),
    event text NOT NULL,
    details jsonb NOT NULL,
    status_before_id bigint REFERENCES asset_status(id),
    status_after_id bigint REFERENCES asset_status(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TRIGGER set_asset_logs_updated_at
BEFORE UPDATE ON public.asset_logs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_asset_logs_asset_id ON public.asset_logs(asset_id);
CREATE INDEX idx_asset_logs_user_id ON public.asset_logs(user_id);
CREATE INDEX idx_asset_logs_deleted_at ON public.asset_logs(deleted_at);

ALTER TABLE public.asset_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users can insert" ON public.asset_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update" ON public.asset_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable read access for all users" ON public.asset_logs FOR SELECT USING (true);
CREATE POLICY "admin_total_access" ON public.asset_logs TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMIT;
