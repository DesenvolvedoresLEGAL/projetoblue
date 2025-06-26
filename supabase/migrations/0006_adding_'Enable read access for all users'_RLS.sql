-- Profiles
CREATE POLICY "Enable read access for all users"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

-- Asset Client Association
CREATE POLICY "Enable read access for all users"
  ON public.asset_client_assoc
  FOR SELECT
  TO public
  USING (true);

-- Assets
CREATE POLICY "Enable read access for all users"
  ON public.assets
  FOR SELECT
  TO public
  USING (true);

-- Asset Status
CREATE POLICY "Enable read access for all users"
  ON public.asset_status
  FOR SELECT
  TO public
  USING (true);

-- Asset Solutions
CREATE POLICY "Enable read access for all users"
  ON public.asset_solutions
  FOR SELECT
  TO public
  USING (true);

-- Asset Logs
CREATE POLICY "Enable read access for all users"
  ON public.asset_logs
  FOR SELECT
  TO public
  USING (true);

-- Plans
CREATE POLICY "Enable read access for all users"
  ON public.plans
  FOR SELECT
  TO public
  USING (true);

-- Manufacturers
CREATE POLICY "Enable read access for all users"
  ON public.manufacturers
  FOR SELECT
  TO public
  USING (true);

-- Locations
CREATE POLICY "Enable read access for all users"
  ON public.locations
  FOR SELECT
  TO public
  USING (true);

-- Operation Locks
CREATE POLICY "Enable read access for all users"
  ON public.operation_locks
  FOR SELECT
  TO public
  USING (true);

-- Profile Logs
CREATE POLICY "Enable read access for all users"
  ON public.profile_logs
  FOR SELECT
  TO public
  USING (true);

-- Client Logs
CREATE POLICY "Enable read access for all users"
  ON public.client_logs
  FOR SELECT
  TO public
  USING (true);

-- Association Types
CREATE POLICY "Enable read access for all users"
  ON public.association_types
  FOR SELECT
  TO public
  USING (true);
