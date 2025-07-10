CREATE OR REPLACE FUNCTION public.update_asset_status(asset_id text, new_status_id bigint)
RETURNS void 
LANGUAGE plpgsql SECURITY DEFINER AS $$ 
BEGIN 
    IF asset_id IS NULL THEN 
        RAISE NOTICE 'asset_id nulo – pulando';
    END IF;
    UPDATE assets
    SET status_id = new_status_id
    WHERE uuid = asset_id;
END;
$$;

-- Função trigger
CREATE OR REPLACE FUNCTION public.association_end_logic() 
RETURNS "trigger" 
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    association_status_ref bigint;
BEGIN 

    association_status_ref := (SELECT id FROM asset_status WHERE association = NEW.association_type_id);

    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = FALSE THEN
            IF NEW.equipment_id IS NOT NULL THEN
            PERFORM update_asset_status(NEW.equipment_id, 1);
            END IF;
            IF NEW.chip_id IS NOT NULL THEN
            PERFORM update_asset_status(NEW.chip_id, 1);
            END IF;
        ELSE
            IF NEW.equipment_id IS NOT NULL THEN
            PERFORM update_asset_status(NEW.equipment_id, association_status_ref);
            END IF;
            IF NEW.chip_id IS NOT NULL THEN
            PERFORM update_asset_status(NEW.chip_id, association_status_ref);
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER association_end_logic_trigger
AFTER UPDATE ON public.associations FOR EACH ROW EXECUTE FUNCTION public.association_end_logic();

ALTER FUNCTION public.association_end_logic()
SET search_path = 'public';