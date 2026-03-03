-- Add groq_ai_enabled setting for Super Admin toggle (default: disabled)
INSERT INTO admin_settings (key, value) VALUES
  ('groq_ai_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
