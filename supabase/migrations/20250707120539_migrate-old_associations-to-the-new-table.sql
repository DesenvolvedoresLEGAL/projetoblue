SET session_replication_role = replica;
INSERT INTO associations (
  uuid,
  client_id,
  equipment_id,
  chip_id,
  entry_date,
  exit_date,
  association_type_id,
  plan_id,
  plan_gb,
  equipment_ssid,
  equipment_pass,
  status,
  notes,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  gen_random_uuid(),
  aca.client_id,
  CASE
    WHEN a.solution_id = 11 THEN NULL
    ELSE aca.asset_id
  END AS equipment_id,
  CASE
    WHEN a.solution_id = 11 THEN aca.asset_id
    ELSE NULL
  END AS chip_id,
  aca.entry_date,
  aca.exit_date,
  aca.association_id,
  aca.plan_id,
  aca.gb,
  aca.ssid,
  aca.pass,
  -- exemplo de status: ativo se exit_date for nulo
  (aca.exit_date IS NULL OR aca.exit_date >= now()) AS status,
  COALESCE(aca.notes, '') || ' | legacy_id: ' || COALESCE(aca.id::text, '') AS notes, -- Queria concatenar o valor assoc_id da tabela asset_client_assoc (aca) a esse valor notes
  aca.created_at,
  aca.updated_at,
  aca.deleted_at
FROM asset_client_assoc AS aca
JOIN assets AS a
  ON aca.asset_id = a.uuid
-- opcional: só migrar associações não deletadas
WHERE aca.deleted_at IS NULL;
SET session_replication_role = DEFAULT;
