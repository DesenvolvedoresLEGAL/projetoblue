SELECT 'alter function public.' || proname || '(' ||
       pg_get_function_identity_arguments(p.oid) ||
       ') set search_path = ''public'';'
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
ORDER BY proname;