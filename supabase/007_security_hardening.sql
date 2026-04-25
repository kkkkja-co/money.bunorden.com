-- ============================================================
-- 007_security_hardening.sql
-- 
-- Fixes "exposed auth users" and "security definer view" alerts.
-- 1. Removes the bulk user_emails view.
-- 2. Adds granular RPC functions for user lookup.
-- 3. Enables pgcrypto for potential field encryption.
-- ============================================================

-- ── 1. CLEANUP ────────────────────────────────────────────────
DROP VIEW IF EXISTS public.user_emails;

-- ── 2. SECURE USER LOOKUP ─────────────────────────────────────

-- Function to find a user ID by email (used when sending invites)
-- This is SECURITY DEFINER so it can access auth.users, but it 
-- only returns a single ID for a specific email, preventing enumeration.
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_to_find TEXT)
RETURNS TABLE (id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Basic auth check
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT u.id
  FROM auth.users u
  WHERE u.email = LOWER(email_to_find);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;

-- Function to get a user email by ID (used in sharing management)
-- Only allows looking up emails of people you have shared something with 
-- or who have shared something with you.
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(id_to_find UUID)
RETURNS TABLE (email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Basic auth check
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Security check: only return email if there's a relationship in notifications
  -- (either I sent them an invite or they sent me one)
  IF EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE (n.sender_id = auth.uid() AND n.user_id = id_to_find)
       OR (n.sender_id = id_to_find AND n.user_id = auth.uid())
  ) OR id_to_find = auth.uid() THEN
    RETURN QUERY
    SELECT u.email::TEXT
    FROM auth.users u
    WHERE u.id = id_to_find;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_email_by_id(UUID) TO authenticated;

-- ── 3. DATA ENCRYPTION PREP ───────────────────────────────────
-- Enable pgcrypto for application-level or DB-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Simple symmetric encryption helper (using a secret key)
-- NOTE: In a real production app, you would use Supabase Vault (pg_sodium)
-- but this provides a baseline 'encryption-at-rest' for sensitive fields.

CREATE OR REPLACE FUNCTION public.encrypt_text(plain_text TEXT, secret_key TEXT)
RETURNS BYTEA 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN pgp_sym_encrypt(plain_text, secret_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_text(encrypted_data BYTEA, secret_key TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_data, secret_key);
END;
$$;

GRANT EXECUTE ON FUNCTION public.encrypt_text(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_text(BYTEA, TEXT) TO authenticated;

-- ── 4. SENSITIVE FIELDS UPGRADE (Optional / Example) ──────────
-- To use this, you would migrate cards.number to BYTEA:
-- ALTER TABLE cards ADD COLUMN encrypted_number BYTEA;
-- UPDATE cards SET encrypted_number = encrypt_text(number, 'your-secret-key');
-- ALTER TABLE cards DROP COLUMN number;
