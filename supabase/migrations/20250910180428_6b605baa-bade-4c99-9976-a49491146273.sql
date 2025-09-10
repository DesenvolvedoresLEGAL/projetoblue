-- ======================= BLUE™ · Módulo SETUP - Schema Database =======================

-- Create enum types for better data integrity
CREATE TYPE setup_status AS ENUM ('scheduled', 'in_progress', 'completed', 'approved', 'rejected');
CREATE TYPE order_type AS ENUM ('install', 'uninstall');
CREATE TYPE asset_status_setup AS ENUM ('available', 'in_use', 'maintenance', 'retired');

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  address JSONB NOT NULL,
  type order_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  qr_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Setups table
CREATE TABLE public.setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  technician_id UUID,
  status setup_status NOT NULL DEFAULT 'scheduled',
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assets table for setup module
CREATE TABLE public.setup_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  status asset_status_setup NOT NULL DEFAULT 'available',
  order_id UUID REFERENCES public.orders(id),
  setup_id UUID REFERENCES public.setups(id),
  qr_code TEXT UNIQUE,
  firmware_version TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Setup photos table (encrypted storage)
CREATE TABLE public.setups_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  iv TEXT,
  is_encrypted BOOLEAN DEFAULT true,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Speed tests table
CREATE TABLE public.speed_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  download_mbps NUMERIC(10,2) NOT NULL,
  upload_mbps NUMERIC(10,2) NOT NULL,
  ping_ms NUMERIC(10,2) NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client signatures table (encrypted storage)
CREATE TABLE public.client_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  iv TEXT,
  is_encrypted BOOLEAN DEFAULT true,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signer_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  row_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User devices table for FCM tokens
CREATE TABLE public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fcm_token TEXT NOT NULL,
  platform TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_type ON public.orders(type);
CREATE INDEX idx_orders_scheduled_at ON public.orders(scheduled_at);
CREATE INDEX idx_setups_status ON public.setups(status);
CREATE INDEX idx_setups_technician_id ON public.setups(technician_id);
CREATE INDEX idx_setups_region ON public.setups(region);
CREATE INDEX idx_setup_assets_status ON public.setup_assets(status);
CREATE INDEX idx_setup_assets_serial ON public.setup_assets(serial);
CREATE INDEX idx_speed_tests_download_mbps ON public.speed_tests(download_mbps);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_changed_at ON public.audit_logs(changed_at);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setup_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setups_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speed_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for installer role
CREATE POLICY "Installers can view their setups" ON public.setups
  FOR SELECT USING (auth.jwt() ->> 'role' = 'installer_role' AND technician_id = (auth.jwt() ->> 'sub')::uuid);

CREATE POLICY "Installers can update their setups" ON public.setups
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'installer_role' AND technician_id = (auth.jwt() ->> 'sub')::uuid)
  WITH CHECK (status IN ('in_progress', 'completed'));

CREATE POLICY "Installers can view setup photos" ON public.setups_photos
  FOR SELECT USING (auth.jwt() ->> 'role' = 'installer_role' AND setup_id IN (
    SELECT id FROM public.setups WHERE technician_id = (auth.jwt() ->> 'sub')::uuid
  ));

CREATE POLICY "Installers can insert setup photos" ON public.setups_photos
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'installer_role' AND setup_id IN (
    SELECT id FROM public.setups WHERE technician_id = (auth.jwt() ->> 'sub')::uuid
  ));

-- Create RLS policies for supervisor role
CREATE POLICY "Supervisors can view setups in their region" ON public.setups
  FOR SELECT USING (auth.jwt() ->> 'role' = 'supervisor_role' AND region = auth.jwt() ->> 'region');

CREATE POLICY "Supervisors can approve/reject setups" ON public.setups
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'supervisor_role' AND region = auth.jwt() ->> 'region')
  WITH CHECK (status IN ('approved', 'rejected'));

-- Create RLS policies for admin role
CREATE POLICY "Admins can access all data" ON public.orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin_role');

CREATE POLICY "Admins can access all setups" ON public.setups
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin_role');

CREATE POLICY "Admins can access all assets" ON public.setup_assets
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin_role');

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.log_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, action, row_id, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    (auth.jwt() ->> 'sub')::uuid
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER audit_orders_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_change();

CREATE TRIGGER audit_setups_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.setups
  FOR EACH ROW EXECUTE FUNCTION public.log_change();

CREATE TRIGGER audit_assets_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.setup_assets
  FOR EACH ROW EXECUTE FUNCTION public.log_change();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for timestamps
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setups_updated_at
  BEFORE UPDATE ON public.setups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_assets_updated_at
  BEFORE UPDATE ON public.setup_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create view for detailed setups
CREATE VIEW public.vw_setups_detailed AS
SELECT 
  s.*,
  o.customer_id,
  o.address,
  o.type as order_type,
  o.scheduled_at as order_scheduled_at,
  COUNT(sp.id) as photos_count,
  COUNT(st.id) as speed_tests_count,
  COUNT(cs.id) as signatures_count,
  ARRAY_AGG(DISTINCT sa.serial) FILTER (WHERE sa.serial IS NOT NULL) as asset_serials
FROM public.setups s
LEFT JOIN public.orders o ON s.order_id = o.id
LEFT JOIN public.setups_photos sp ON s.id = sp.setup_id
LEFT JOIN public.speed_tests st ON s.id = st.setup_id
LEFT JOIN public.client_signatures cs ON s.id = cs.setup_id
LEFT JOIN public.setup_assets sa ON s.id = sa.setup_id
GROUP BY s.id, o.customer_id, o.address, o.type, o.scheduled_at;