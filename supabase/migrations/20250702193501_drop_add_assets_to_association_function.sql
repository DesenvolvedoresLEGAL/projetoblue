DROP FUNCTION IF EXISTS public.add_assets_to_association(
    p_client_id text,
    p_association_id bigint,
    p_entry_date date,
    p_asset_ids text[],
    p_exit_date date,
    p_notes text,
    p_ssid text,
    p_pass text,
    p_gb bigint
);
