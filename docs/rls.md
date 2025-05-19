
# Row-Level Security (RLS) Policies Documentation

This document outlines the Row-Level Security policies implemented in the BLUE application database. These policies control data access to ensure that users can only view and modify resources they have permission to access.

## Overview

Row-Level Security is enabled on the following tables:
- `profiles`
- `assets`
- `clients`
- `asset_client_assoc`
- `asset_logs`

## Profiles Table Policies

The `profiles` table contains user profile information that is accessible only to:
1. The user themselves
2. Admin users who can view all profiles

### Policies:

1. **Users can view their own profile**
   ```sql
   CREATE POLICY "Users can view their own profile"
     ON profiles
     FOR SELECT
     USING (auth.uid() = id);
   ```

2. **Users can update their own profile**
   ```sql
   CREATE POLICY "Users can update their own profile"
     ON profiles
     FOR UPDATE
     USING (auth.uid() = id);
   ```

## Assets Table Policies

The `assets` table contains information about various assets in the system. Access to this table is controlled based on user role and asset ownership.

### Policies:

1. **Authenticated users can view assets**
   ```sql
   CREATE POLICY "Authenticated users can view assets"
     ON assets
     FOR SELECT
     TO authenticated
     USING (true);
   ```

2. **Only admin and ops can create assets**
   ```sql
   CREATE POLICY "Only admin and ops can create assets"
     ON assets
     FOR INSERT
     TO authenticated
     WITH CHECK (
       public.has_role(auth.uid(), 'admin') OR 
       public.has_role(auth.uid(), 'ops')
     );
   ```

3. **Only admin and ops can update assets**
   ```sql
   CREATE POLICY "Only admin and ops can update assets"
     ON assets
     FOR UPDATE
     TO authenticated
     USING (
       public.has_role(auth.uid(), 'admin') OR 
       public.has_role(auth.uid(), 'ops')
     );
   ```

## Clients Table Policies

The `clients` table stores information about client organizations.

### Policies:

1. **Authenticated users can view clients**
   ```sql
   CREATE POLICY "Authenticated users can access clients"
     ON clients
     FOR SELECT
     TO authenticated
     USING (true);
   ```

2. **Only admin and ops can modify clients**
   ```sql
   CREATE POLICY "Only admin and ops can modify clients"
     ON clients
     FOR ALL
     TO authenticated
     USING (
       public.has_role(auth.uid(), 'admin') OR 
       public.has_role(auth.uid(), 'ops')
     );
   ```

## Asset-Client Association Policies

The `asset_client_assoc` table manages the relationship between assets and clients.

### Policies:

1. **Authenticated users can view associations**
   ```sql
   CREATE POLICY "Authenticated users can access asset_client_assoc"
     ON asset_client_assoc
     FOR SELECT
     TO authenticated
     USING (true);
   ```

2. **Only admin and ops can modify associations**
   ```sql
   CREATE POLICY "Only admin and ops can modify associations"
     ON asset_client_assoc
     FOR ALL
     TO authenticated
     USING (
       public.has_role(auth.uid(), 'admin') OR 
       public.has_role(auth.uid(), 'ops')
     );
   ```

## Testing RLS Policies

To verify that RLS policies are working correctly, you can perform the following tests:

### 1. Testing as Anonymous User

```sql
-- Reset role to anonymous
RESET ROLE;

-- Attempt to select from profiles (should fail)
SELECT * FROM profiles LIMIT 1;
-- Should return error: permission denied for table profiles

-- Attempt to insert into assets (should fail)
INSERT INTO assets (type_id, model) VALUES (1, 'TEST');
-- Should return error: new row violates row-level security policy
```

### 2. Testing as Regular User

```sql
-- Assume role of a regular user (replace USER_ID with actual UUID)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'USER_ID';

-- Select from profiles (should only show user's own profile)
SELECT * FROM profiles;
-- Should return only the row where id = USER_ID

-- Attempt to insert into assets (should fail for non-admin/ops)
INSERT INTO assets (type_id, model) VALUES (1, 'TEST');
-- Should return error if user doesn't have admin/ops role
```

### 3. Testing as Admin User

```sql
-- Assume role of an admin user (replace ADMIN_ID with actual UUID)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'ADMIN_ID';

-- Select from profiles (should show all profiles)
SELECT * FROM profiles;
-- Should return all rows if admin role works correctly

-- Insert into assets (should succeed)
INSERT INTO assets (type_id, model) VALUES (1, 'TEST');
-- Should succeed if admin role works correctly
```

### 4. Testing Security Definer Functions

Verify that the `has_role` function works correctly:

```sql
-- Test has_role function with a user ID and role
SELECT public.has_role('USER_ID', 'admin');
-- Should return true or false based on whether the user has that role
```

## Common RLS Issues and Solutions

1. **Issue**: User cannot see any data even though they should have access.
   **Solution**: Check if the user's role is correctly set in the profiles table.

2. **Issue**: RLS policies seem to have no effect; any user can access all data.
   **Solution**: Verify that RLS is enabled on the table (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`).

3. **Issue**: Infinite recursion error when using RLS.
   **Solution**: Ensure that RLS policies don't query the same table they're protecting.

4. **Issue**: RLS policies work in the SQL Editor but not from the application.
   **Solution**: Check that the application is sending the correct JWT token and that the user is properly authenticated.
