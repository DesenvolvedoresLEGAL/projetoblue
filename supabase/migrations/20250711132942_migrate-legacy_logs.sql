SET session_replication_role = replica;
truncate association_logs;
truncate asset_logs;
-- Migrate association related logs
INSERT INTO association_logs (
  uuid,
  user_id,
  association_uuid,
  event,
  details,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  gen_random_uuid(),
  (al.details ->> 'user_id')::uuid,
  assoc.uuid,
  CASE al.event
    WHEN 'ASSET_CRIADO'               THEN 'INSERT'
    WHEN 'ASSOCIATION_CREATED'        THEN 'INSERT'
    WHEN 'STATUS_UPDATED'             THEN 'UPDATE'
    WHEN 'ASSOCIATION_STATUS_UPDATED' THEN 'UPDATE'
    WHEN 'TRIGGER_ERROR'              THEN 'UPDATE'
    WHEN 'ASSOCIATION_REMOVED'        THEN 'DELETE'
    WHEN 'ASSET_SOFT_DELETE'          THEN 'DELETE'
  END,
  al.details,
  al.created_at,
  al.updated_at,
  al.deleted_at
FROM asset_logs_legacy al
LEFT JOIN asset_client_assoc aca ON aca.id = al.assoc_id
LEFT JOIN associations assoc ON assoc.notes LIKE '%legacy_id: ' || al.assoc_id::text || '%'
WHERE al.assoc_id IS NOT NULL
  AND assoc.uuid IS NOT NULL
  AND al.event IN (
    'ASSOCIATION_CREATED',
    'ASSOCIATION_STATUS_UPDATED',
    'ASSOCIATION_REMOVED'
  );

-- Migrate asset related logs
INSERT INTO asset_logs (
  uuid,
  user_id,
  asset_id,
  event,
  details,
  status_before_id,
  status_after_id,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  gen_random_uuid(),
  coalesce((al.details ->> 'user_id')::uuid, 'ff8cc3df-5f83-4e1f-a009-46c0444b3826'),
  COALESCE(
    al.details ->> 'asset_id',
    aca.asset_id,
    a.uuid,
    (SELECT uuid FROM assets WHERE line_number = (al.details->>'line_number')::bigint),
    (SELECT uuid FROM assets WHERE radio = al.details->>'radio')
  ) AS asset_id,
  CASE al.event
    WHEN 'ASSET_CRIADO'               THEN 'INSERT'
    WHEN 'ASSOCIATION_CREATED'        THEN 'INSERT'
    WHEN 'STATUS_UPDATED'             THEN 'UPDATE'
    WHEN 'ASSOCIATION_STATUS_UPDATED' THEN 'UPDATE'
    WHEN 'TRIGGER_ERROR'              THEN 'UPDATE'
    WHEN 'ASSOCIATION_REMOVED'        THEN 'DELETE'
    WHEN 'ASSET_SOFT_DELETE'          THEN 'DELETE'
  END,
  al.details,
  al.status_before_id,
  al.status_after_id,
  al.created_at,
  al.updated_at,
  al.deleted_at
FROM asset_logs_legacy al
LEFT JOIN asset_client_assoc aca ON aca.id = al.assoc_id
LEFT JOIN assets a ON
  a.uuid = COALESCE(al.details ->> 'asset_id', aca.asset_id)
  OR a.line_number = COALESCE((al.details->>'line_number')::bigint, 0)
  OR a.radio = al.details->>'radio'
WHERE (al.event = 'ASSET_CRIADO'
  OR al.event = 'STATUS_UPDATED'
  OR al.event = 'TRIGGER_ERROR'
  OR al.event = 'ASSET_SOFT_DELETE')
  AND COALESCE(
    al.details ->> 'asset_id',
    aca.asset_id,
    a.uuid,
    (SELECT uuid FROM assets WHERE line_number = (al.details->>'line_number')::bigint),
    (SELECT uuid FROM assets WHERE radio = al.details->>'radio')
  ) IS NOT NULL;

SET session_replication_role = DEFAULT;