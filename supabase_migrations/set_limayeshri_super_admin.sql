-- Grant super_admin role to limayeshri@gmail.com so they can access Admin Console
-- Temporarily disable the role-change trigger (it blocks non-super_admin from changing roles)
DROP TRIGGER IF EXISTS profiles_prevent_role_change_trigger ON profiles;
UPDATE profiles SET role = 'super_admin' WHERE email = 'limayeshri@gmail.com';
-- Recreate the trigger
CREATE TRIGGER profiles_prevent_role_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_prevent_role_change();
