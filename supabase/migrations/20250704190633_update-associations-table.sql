create type association_status AS enum ('ativa', 'encerrada');

create table associations (
  uuid text not null default gen_random_uuid (),
  client_id text not null,
  equipment_id text null,
  chip_id text null,
  entry_date date not null,
  exit_date date null,
  association_id bigint not null,
  plan_id bigint null,
  plan_gb bigint null default '0'::bigint,
  equipment_ssid text null,
  equipment_pass text null,
  status association_status not null default 'ativa'::association_status,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone null,
  constraint equipment_id_fkey foreign key (equipment_id) references assets(uuid),
  constraint chip_id_fkey foreign key (chip_id) references assets(uuid),
  constraint client_id_fkey foreign key (client_id) references clients(uuid),
  constraint associations_pkey primary key (uuid)  
);

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
