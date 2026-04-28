-- Role-Based Admin System for AveronSoft
-- Run this in Supabase SQL Editor AFTER the main schema

-- Add role and banned columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'support', 'user'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;

-- Set initial super_admin for existing admin email (run once, adjust email as needed)
UPDATE profiles SET role = 'super_admin' WHERE email = 'stonehavenst@gmail.com';

-- Drop existing profile RLS policies to replace
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- New RLS: Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins and super_admins can read all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin', 'support')
    )
  );

-- Users can update their own profile (trigger prevents role change for non-super_admin)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: only super_admin can change role via direct UPDATE
CREATE OR REPLACE FUNCTION public.profiles_prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin') THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  IF OLD.banned IS DISTINCT FROM NEW.banned THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')) THEN
      NEW.banned := OLD.banned;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_prevent_role_change_trigger ON profiles;
CREATE TRIGGER profiles_prevent_role_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_prevent_role_change();

-- Only super_admin can update roles (separate policy via service role or function)
-- We use a SECURITY DEFINER function for role updates
CREATE OR REPLACE FUNCTION public.update_user_role(target_id UUID, new_role TEXT)
RETURNS void AS $$
BEGIN
  IF new_role NOT IN ('super_admin', 'admin', 'support', 'user') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin') THEN
    RAISE EXCEPTION 'Only super_admin can update roles';
  END IF;
  UPDATE profiles SET role = new_role, updated_at = NOW() WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_user_banned(target_id UUID, banned BOOLEAN)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')) THEN
    RAISE EXCEPTION 'Only admin or super_admin can ban users';
  END IF;
  UPDATE profiles SET banned = banned, updated_at = NOW() WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for logs: admins and support can read
DROP POLICY IF EXISTS "Admins can view logs" ON logs;
CREATE POLICY "Admins can view logs"
  ON logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support'))
  );

-- RLS for abuse_reports: admins and support can read, admins can update
DROP POLICY IF EXISTS "Admins can view abuse_reports" ON abuse_reports;
CREATE POLICY "Admins can view abuse_reports"
  ON abuse_reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support'))
  );

CREATE POLICY "Admins can update abuse_reports"
  ON abuse_reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- RLS for admin_settings: only admins can read/write
DROP POLICY IF EXISTS "Admins can manage admin_settings" ON admin_settings;
CREATE POLICY "Admins can manage admin_settings"
  ON admin_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Insert default admin_settings for tools, maintenance, API
INSERT INTO admin_settings (key, value) VALUES
  ('global_maintenance', 'false'::jsonb),
  ('maintenance_message', '"We are performing scheduled maintenance. Please check back soon."'::jsonb),
  ('shortener_maintenance', 'false'::jsonb),
  ('bookmarks_maintenance', 'false'::jsonb),
  ('businesscard_maintenance', 'false'::jsonb),
  ('aiworkspace_maintenance', 'false'::jsonb),
  ('tool_shortener_enabled', 'true'::jsonb),
  ('tool_bookmarks_enabled', 'true'::jsonb),
  ('tool_businesscard_enabled', 'true'::jsonb),
  ('tool_aiworkspace_enabled', 'true'::jsonb),
  ('tool_shortener_visible', 'true'::jsonb),
  ('tool_bookmarks_visible', 'true'::jsonb),
  ('tool_businesscard_visible', 'true'::jsonb),
  ('tool_aiworkspace_visible', 'true'::jsonb),
  ('tool_shortener_beta', 'false'::jsonb),
  ('tool_bookmarks_beta', 'false'::jsonb),
  ('tool_businesscard_beta', 'false'::jsonb),
  ('tool_aiworkspace_beta', 'false'::jsonb),
  ('api_enabled', 'true'::jsonb),
  ('support_email', '"stonehavenst@gmail.com"'::jsonb),
  ('branding_text', '"Professional Tools for Modern Professionals"'::jsonb)
ON CONFLICT (key) DO NOTHING;
