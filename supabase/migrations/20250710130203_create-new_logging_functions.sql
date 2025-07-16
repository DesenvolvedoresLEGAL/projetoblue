CREATE OR REPLACE FUNCTION public.log_association_event()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public, auth'
AS $$
DECLARE
    v_user uuid := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000');
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO association_logs (user_id, association_uuid, event, details)
        VALUES (
            v_user,
            NEW.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'new_record', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO association_logs (user_id, association_uuid, event, details)
        VALUES (
            v_user,
            NEW.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'old_record', row_to_json(OLD),
                'new_record', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO association_logs (user_id, association_uuid, event, details)
        VALUES (
            v_user,
            OLD.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'old_record', row_to_json(OLD)
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;
CREATE OR REPLACE FUNCTION public.log_asset_event()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public, auth'
AS $$
DECLARE
    v_user uuid := auth.uid();
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO asset_logs (user_id, asset_id, event, details)
        VALUES (
            v_user,
            NEW.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'new_record', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO asset_logs (user_id, asset_id, event, details)
        VALUES (
            v_user,
            NEW.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'old_record', row_to_json(OLD),
                'new_record', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO asset_logs (user_id, asset_id, event, details)
        VALUES (
            v_user,
            OLD.uuid,
            TG_OP,
            jsonb_build_object(
                'user', (SELECT row_to_json(p) FROM profiles p WHERE id = v_user),
                'old_record', row_to_json(OLD)
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;
CREATE TRIGGER associations_logging_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.associations
FOR EACH ROW EXECUTE FUNCTION public.log_association_event();
CREATE TRIGGER assets_logging_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.assets
FOR EACH ROW EXECUTE FUNCTION public.log_asset_event();
alter function public.log_asset_event() set search_path = 'public';
alter function public.log_association_event() set search_path = 'public';
