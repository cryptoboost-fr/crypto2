-- Link Supabase Auth admin user to application users table
-- Run this AFTER you create the Auth user via Admin API (with email + password)
DO $$
DECLARE
  v_auth_id uuid;
  v_role_admin uuid;
BEGIN
  SELECT id INTO v_auth_id FROM auth.users WHERE email = 'admin@cryptoboost.world';
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Auth user for admin@cryptoboost.world not found. Create it first via Admin API.';
  END IF;

  SELECT id INTO v_role_admin FROM public.roles WHERE name = 'admin';
  IF v_role_admin IS NULL THEN
    RAISE EXCEPTION 'Role admin not found. Ensure 001_initial_schema.sql has been executed.';
  END IF;

  -- Upsert application-level admin row to match Auth user id
  INSERT INTO public.users (id, email, role_id)
  VALUES (v_auth_id, 'admin@cryptoboost.world', v_role_admin)
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    role_id = EXCLUDED.role_id;
END $$;