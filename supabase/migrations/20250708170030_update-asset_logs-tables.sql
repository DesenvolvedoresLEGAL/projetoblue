-- Update asset_logs.assoc_id to reference associations table

-- Drop old foreign key
ALTER TABLE asset_logs DROP CONSTRAINT IF EXISTS fk_asset_logs_assoc_id;

-- Change column type to text
ALTER TABLE asset_logs
  ALTER COLUMN assoc_id TYPE text USING assoc_id::text;

-- Migrate existing data: map old asset_client_assoc IDs to new association UUIDs
UPDATE asset_logs AS log
SET assoc_id = assoc.uuid
FROM asset_client_assoc aca
JOIN assets a ON aca.asset_id = a.uuid
JOIN associations assoc ON assoc.client_id = aca.client_id
  AND assoc.entry_date = aca.entry_date
  AND assoc.exit_date IS NOT DISTINCT FROM aca.exit_date
  AND assoc.association_type_id = aca.association_id
  AND assoc.plan_id IS NOT DISTINCT FROM aca.plan_id
  AND assoc.plan_gb IS NOT DISTINCT FROM aca.gb
  AND assoc.equipment_ssid IS NOT DISTINCT FROM aca.ssid
  AND assoc.equipment_pass IS NOT DISTINCT FROM aca.pass
  AND (
      (a.solution_id = 11 AND assoc.chip_id = aca.asset_id)
      OR (a.solution_id <> 11 AND assoc.equipment_id = aca.asset_id)
  )
WHERE log.assoc_id::bigint = aca.id;

-- Add new foreign key referencing associations(uuid)
ALTER TABLE asset_logs
  ADD CONSTRAINT fk_asset_logs_assoc_id FOREIGN KEY (assoc_id)
  REFERENCES associations (uuid) ON DELETE SET NULL;