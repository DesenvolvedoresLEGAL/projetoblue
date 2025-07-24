-- Migration: 20250724121948_delete_email_and_contact_client_constraints.sql
-- Description: Remove unique constraints on email and contact fields in clients table
-- Table: public.clients
-- Autor: Gustavo Macedo
-- Data: 2025-07-24 12:19:48

BEGIN;
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_contato_key;
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_email_key;
COMMIT;

-- ROLLBACK;
-- ALTER TABLE public.clients ADD CONSTRAINT clients_contato_key UNIQUE (contato);
-- ALTER TABLE public.clients ADD CONSTRAINT clients_email_key UNIQUE (email);
-- COMMIT;