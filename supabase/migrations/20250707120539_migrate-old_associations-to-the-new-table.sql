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
  CASE WHEN a.solution_id = 11 THEN NULL ELSE aca.asset_id END AS equipment_id,
  CASE WHEN a.solution_id = 11 THEN aca.asset_id ELSE NULL END AS chip_id,
  aca.entry_date,
  aca.exit_date,
  aca.association_id,
  aca.plan_id,
  aca.gb,
  aca.ssid,
  aca.pass,
  (aca.exit_date IS NULL OR aca.exit_date < aca.entry_date) AS status,
  aca.notes,
  aca.created_at,
  aca.updated_at,
  aca.deleted_at
FROM asset_client_assoc aca
JOIN assets a ON aca.asset_id = a.uuid;