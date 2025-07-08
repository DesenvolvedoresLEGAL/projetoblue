BEGIN;

-- Migrate association events
INSERT INTO public.association_logs (uuid, user_id, association_uuid, event, details, created_at, updated_at, deleted_at)
SELECT
    gen_random_uuid(),
    (al.details->>'user_id')::uuid,
    assoc.uuid,
    al.event,
    al.details,
    al.created_at,
    al.updated_at,
    al.deleted_at
FROM public.asset_logs_legacy al
LEFT JOIN public.asset_client_assoc aca ON aca.id = al.assoc_id
LEFT JOIN public.associations assoc ON
    assoc.client_id = aca.client_id AND
    assoc.entry_date = aca.entry_date AND
    COALESCE(assoc.exit_date, 'infinity') = COALESCE(aca.exit_date, 'infinity') AND
    assoc.association_type_id = aca.association_id AND
    ((assoc.equipment_id = aca.asset_id AND assoc.chip_id IS NULL) OR
     (assoc.chip_id = aca.asset_id AND assoc.equipment_id IS NULL)) AND
    assoc.deleted_at IS NOT DISTINCT FROM aca.deleted_at
WHERE al.event LIKE 'ASSOCIATION_%';

-- Migrate remaining asset events
INSERT INTO public.asset_logs (uuid, user_id, asset_id, event, details, status_before_id, status_after_id, created_at, updated_at, deleted_at)
SELECT
    gen_random_uuid(),
    (details->>'user_id')::uuid,
    (details->>'asset_id')::uuid,
    event,
    details,
    status_before_id,
    status_after_id,
    created_at,
    updated_at,
    deleted_at
FROM public.asset_logs_legacy
WHERE event NOT LIKE 'ASSOCIATION_%';

DROP TABLE public.asset_logs_legacy;
DROP SEQUENCE IF EXISTS public.asset_history_id_seq;

COMMIT;
