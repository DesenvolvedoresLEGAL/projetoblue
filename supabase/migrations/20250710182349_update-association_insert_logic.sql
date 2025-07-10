-- Função comum
CREATE OR REPLACE FUNCTION public.update_asset_status_by_association(
  asset_id text, association_type_id bigint
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF asset_id IS NULL THEN
    RAISE NOTICE 'asset_id nulo – pulando';
    RETURN;
  END IF;
  UPDATE assets
  SET status_id = (SELECT id FROM asset_status WHERE association = association_type_id),
      updated_at = now()
  WHERE uuid = asset_id;
END;
$$;

-- Função trigger
CREATE OR REPLACE FUNCTION public.association_insert_logic()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public, auth, pg_temp'
AS $$
DECLARE
  is_equipment_free boolean;
  is_chip_free boolean;
BEGIN

IF NEW.equipment_id IS NOT NULL THEN
    is_equipment_free := EXISTS (SELECT 1 FROM assets WHERE uuid = NEW.equipment_id AND status_id = 1);
END IF;

IF NEW.chip_id IS NOT NULL THEN
    is_chip_free := EXISTS (SELECT 1 FROM assets WHERE uuid = NEW.chip_id AND status_id = 1);
END IF;

IF is_equipment_free = FALSE THEN
    IF is_chip_free = FALSE THEN
        RAISE EXCEPTION '[association_insert_logic] Ativos indisponíveis.';
    END IF;
    RAISE EXCEPTION '[association_insert_logic] Equipamento % indisponível.', (SELECT radio FROM assets WHERE uuid = NEW.equipment_id);
ELSIF is_chip_free = FALSE THEN
    RAISE EXCEPTION '[association_insert_logic] Chip % indisponível.', (SELECT iccid FROM assets WHERE uuid = NEW.chip_id);
END IF;

  PERFORM public.update_asset_status_by_association(NEW.equipment_id::text, NEW.association_type_id::bigint);
  PERFORM public.update_asset_status_by_association(NEW.chip_id::text, NEW.association_type_id::bigint);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER association_insert_logic AFTER INSERT ON public.associations FOR EACH ROW EXECUTE FUNCTION public.association_insert_logic();

ALTER FUNCTION public.association_insert_logic() SET search_path = 'public';
ALTER FUNCTION public.update_asset_status_by_association(text, bigint) SET search_path = 'public';