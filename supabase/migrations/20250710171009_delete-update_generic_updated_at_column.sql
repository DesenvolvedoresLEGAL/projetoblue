DROP TRIGGER IF EXISTS client_logs_updated_at_trigger ON client_logs;
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
DROP TRIGGER IF EXISTS update_manufacturer_updated_at ON manufacturers;
DROP FUNCTION IF EXISTS update_generic_updated_at_column CASCADE;
