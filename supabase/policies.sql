
-- Execute estas instruções no Supabase caso as políticas atuais permitam acesso público.
-- As políticas abaixo garantem que apenas usuários autenticados possam acessar os dados.

-- assets
drop policy if exists "Enable read access for all users" on public.assets;
create policy "Authenticated users can access assets"
  on public.assets for select
  to authenticated using (true);

-- clients
drop policy if exists "Enable read access for all users" on public.clients;
create policy "Authenticated users can access clients"
  on public.clients for select
  to authenticated using (true);

-- asset_client_assoc
drop policy if exists "Enable read access for all users" on public.asset_client_assoc;
create policy "Authenticated users can access asset_client_assoc"
  on public.asset_client_assoc for select
  to authenticated using (true);

-- asset_logs
drop policy if exists "Enable read access for all users" on public.asset_logs;
create policy "Authenticated users can access asset_logs"
  on public.asset_logs for select
  to authenticated using (true);

-- profiles - more restricted - users can only see their own profile
drop policy if exists "Enable read access for all users" on public.profiles;
create policy "Users can access their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);
