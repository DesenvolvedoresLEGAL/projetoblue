DROP FUNCTION IF EXISTS acquire_operation_lock CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_locks CASCADE;
DROP FUNCTION IF EXISTS release_operation_lock CASCADE;
DROP TABLE    IF EXISTS operation_locks CASCADE;