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
