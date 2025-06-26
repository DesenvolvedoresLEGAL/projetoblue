-- Profiles
CREATE POLICY "admin_total_access"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Asset Client Association
CREATE POLICY "admin_total_access"
  ON public.asset_client_assoc
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Assets
CREATE POLICY "admin_total_access"
  ON public.assets
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Asset Status
CREATE POLICY "admin_total_access"
  ON public.asset_status
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Asset Solutions
CREATE POLICY "admin_total_access"
  ON public.asset_solutions
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Asset Logs
CREATE POLICY "admin_total_access"
  ON public.asset_logs
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Plans
CREATE POLICY "admin_total_access"
  ON public.plans
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Manufacturers
CREATE POLICY "admin_total_access"
  ON public.manufacturers
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Locations
CREATE POLICY "admin_total_access"
  ON public.locations
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Operation Locks
CREATE POLICY "admin_total_access"
  ON public.operation_locks
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Profile Logs
CREATE POLICY "admin_total_access"
  ON public.profile_logs
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Client Logs
CREATE POLICY "admin_total_access"
  ON public.client_logs
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Association Types
CREATE POLICY "admin_total_access"
  ON public.association_types
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
