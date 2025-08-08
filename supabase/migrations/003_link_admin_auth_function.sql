-- Create a reusable function to link an Auth user to the application users table
-- Usage example (in SQL Editor):
--   SELECT public.link_admin_auth('admin@cryptoboost.world');
-- Returns a text message with the outcome.

create schema if not exists public;

create or replace function public.link_admin_auth(p_email text)
returns text
language plpgsql
security definer
as $$
DECLARE
  v_auth_id uuid;
  v_role_admin uuid;
  v_msg text;
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RAISE EXCEPTION 'Email parameter is required';
  END IF;

  -- 1) Find Auth user
  SELECT id INTO v_auth_id FROM auth.users WHERE lower(email) = lower(p_email);
  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'Auth user for % not found. Create it first via Dashboard (Authentication → Add user) or Admin API.', p_email;
  END IF;

  -- 2) Ensure admin role exists
  SELECT id INTO v_role_admin FROM public.roles WHERE name = 'admin';
  IF v_role_admin IS NULL THEN
    RAISE EXCEPTION 'Role admin not found. Execute 001_initial_schema.sql first.';
  END IF;

  -- 3) Upsert application-level user with same id as auth.users
  INSERT INTO public.users (id, email, role_id)
  VALUES (v_auth_id, p_email, v_role_admin)
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    role_id = EXCLUDED.role_id;

  v_msg := format('Linked auth.users(%%) to public.users(%%) with admin role', v_auth_id);
  RETURN v_msg;
END;
$$;