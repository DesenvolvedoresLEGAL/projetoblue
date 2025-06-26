-- This migration fixes the handle_new_user function which currently fails with "ERROR: relation 'users' does not exist"
-- The fix ensures it correctly references the auth.users table and properly handles role validation

-- Drop the existing function if it exists to recreate it
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
-- Create the improved function with better error handling and role validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  user_role user_role_enum;
BEGIN
  -- Try to safely convert the role from metadata
  BEGIN
    user_role := (new.raw_user_meta_data->>'role')::user_role_enum;
  EXCEPTION 
    WHEN invalid_text_representation THEN
      -- Default to 'cliente' if conversion fails
      user_role := 'cliente'::user_role_enum;
      RAISE NOTICE 'Error converting role for user %: using default role ''cliente''', new.email;
  END;

  INSERT INTO public.profiles (id, email, role, is_active, is_approved)
  VALUES (
    new.id,
    new.email,
    COALESCE(user_role, 'cliente'::user_role_enum),
    true,
    true
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Profile already exists for user %', new.email;
    RETURN new;
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile for %: %', new.email, SQLERRM;
    RETURN new; -- Continue even if there's an error to not block registration
END;
$$;
-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
