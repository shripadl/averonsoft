-- Fix: "infinite recursion detected in policy for relation 'profiles'"
-- The "Admins can view all profiles" policy SELECTs from profiles to check admin role,
-- which triggers the same RLS policies again → infinite recursion.
-- Solution: Use a SECURITY DEFINER function that bypasses RLS when checking the role.

-- Create helper that checks admin role without triggering profiles RLS
CREATE OR REPLACE FUNCTION public.user_has_admin_role()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'support')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate using the SECURITY DEFINER function (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.user_has_admin_role());
