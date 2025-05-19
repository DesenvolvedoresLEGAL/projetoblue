
# Row Level Security (RLS) Policies Documentation

This document describes the Row Level Security (RLS) policies implemented in the BLUE system database to ensure data access is properly controlled and secured.

## Current RLS Policies

### Table: profiles

Profiles table stores user profile information linked to Supabase auth.users.

#### Policies:

1. **Users can only view their own profile**
   - Applies to: SELECT operations
   - Condition: `auth.uid() = id`
   - Description: Users can only view their own profile information.

### Table: assets

Assets table stores information about company assets like chips, routers, etc.

#### Policies:

1. **Authenticated users can view assets**
   - Applies to: SELECT operations
   - Condition: `auth.role() = 'authenticated'`
   - Description: Any authenticated user can view asset information.

2. **Only admins and analysts can create assets**
   - Applies to: INSERT operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'analyst')`
   - Description: Only users with admin or analyst roles can create new assets.

3. **Only admins and ops can update assets**
   - Applies to: UPDATE operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'ops')`
   - Description: Only users with admin or ops roles can update asset information.

4. **Only admins can delete assets**
   - Applies to: DELETE operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'`
   - Description: Only users with admin role can delete assets.

### Table: clients

Clients table stores information about company clients.

#### Policies:

1. **Authenticated users can view clients**
   - Applies to: SELECT operations
   - Condition: `auth.role() = 'authenticated'`
   - Description: Any authenticated user can view client information.

2. **Only admins and analysts can create clients**
   - Applies to: INSERT operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'analyst')`
   - Description: Only users with admin or analyst roles can create new clients.

3. **Only admins and ops can update clients**
   - Applies to: UPDATE operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'ops')`
   - Description: Only users with admin or ops roles can update client information.

4. **Only admins can delete clients**
   - Applies to: DELETE operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'`
   - Description: Only users with admin role can delete clients.

### Table: asset_client_assoc

Asset-client associations table links assets to clients.

#### Policies:

1. **Authenticated users can view associations**
   - Applies to: SELECT operations
   - Condition: `auth.role() = 'authenticated'`
   - Description: Any authenticated user can view asset-client associations.

2. **Only admins, analysts and ops can create associations**
   - Applies to: INSERT operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'analyst', 'ops')`
   - Description: Only users with admin, analyst, or ops roles can create new associations.

3. **Only admins and ops can update associations**
   - Applies to: UPDATE operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'ops')`
   - Description: Only users with admin or ops roles can update associations.

4. **Only admins can delete associations**
   - Applies to: DELETE operations
   - Condition: `(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'`
   - Description: Only users with admin role can delete associations.

## Testing RLS Policies

To test that the RLS policies are working correctly, follow these steps:

1. **Setup test users with different roles**:
   - Create a test user with 'admin' role
   - Create a test user with 'analyst' role
   - Create a test user with 'ops' role
   - Create a test user with 'user' role

2. **Test access patterns**:
   
   a. **As an unauthenticated user**:
   ```sql
   -- This should fail for all tables with RLS
   SELECT * FROM assets LIMIT 10;
   ```
   
   b. **As a regular user**:
   ```sql
   -- Should be able to view assets but not modify
   SELECT * FROM assets LIMIT 10;
   INSERT INTO assets (type_id, model) VALUES (1, 'Test Model'); -- Should fail
   ```
   
   c. **As an analyst**:
   ```sql
   -- Should be able to view and create assets but not update/delete
   SELECT * FROM assets LIMIT 10;
   INSERT INTO assets (type_id, model) VALUES (1, 'Test Model'); -- Should succeed
   UPDATE assets SET model = 'Modified' WHERE model = 'Test Model'; -- Should fail
   ```
   
   d. **As an ops user**:
   ```sql
   -- Should be able to view and update assets but not create/delete
   SELECT * FROM assets LIMIT 10;
   UPDATE assets SET model = 'Modified' WHERE model = 'Test Model'; -- Should succeed
   DELETE FROM assets WHERE model = 'Modified'; -- Should fail
   ```
   
   e. **As an admin**:
   ```sql
   -- Should have full access
   SELECT * FROM assets LIMIT 10;
   INSERT INTO assets (type_id, model) VALUES (1, 'Admin Test');
   UPDATE assets SET model = 'Admin Modified' WHERE model = 'Admin Test';
   DELETE FROM assets WHERE model = 'Admin Modified';
   ```

## Known Issues and Recommendations

1. **Potential recursive RLS issue**: Some RLS policies query the profiles table, which itself has RLS. This could potentially lead to recursive policy evaluation. Consider using security definer functions to avoid this.

2. **Missing RLS on some tables**: Some tables like `asset_logs` don't have RLS policies. Consider adding them.

3. **Role check optimization**: Role checks are done using subqueries, which might impact performance. Consider caching role information or using a security definer function.

## Future Improvements

1. **Use security definer functions**: Replace direct subqueries with security definer functions to improve performance and avoid recursive policy issues.

2. **Implement time-based restrictions**: For certain operations, consider adding time-based restrictions (e.g., can only modify records created in the last 24 hours).

3. **Add detailed audit logging**: Implement triggers to log all data modifications with user information for better audit trails.
