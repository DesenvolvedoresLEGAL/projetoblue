
-- Update the status_by_asset_type function to use asset_solutions instead of asset_categories
CREATE OR REPLACE FUNCTION public.status_by_asset_type()
 RETURNS TABLE(type text, status text, count bigint)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT ac.name as type, ast.status, count(*)
    FROM assets a
    JOIN asset_solutions ac ON ac.id = a.type_id
    JOIN asset_status ast ON ast.id = a.status_id
    GROUP BY ac.name, ast.status;
END;
$function$;
