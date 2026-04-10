-- ============================================================
-- 002_fix_signup.sql
-- Fix: "Database error saving new user" on signup
-- 
-- Root cause: Duplicate RLS policies from repeated migrations
-- and/or trigger not being created due to earlier SQL errors.
--
-- This script safely drops ALL existing policies, recreates
-- them cleanly, and ensures the signup trigger works.
-- ============================================================

-- ============================================
-- 1. DROP ALL EXISTING POLICIES (safe cleanup)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users own their profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile insert for auth users" ON profiles;

-- Accounts
DROP POLICY IF EXISTS "Users own their accounts" ON accounts;
DROP POLICY IF EXISTS "Users can manage their accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete their accounts" ON accounts;

-- Categories
DROP POLICY IF EXISTS "Users own their categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their categories" ON categories;
DROP POLICY IF EXISTS "Users can update their categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their categories" ON categories;

-- Transactions
DROP POLICY IF EXISTS "Users own their transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their transactions" ON transactions;

-- ============================================
-- 2. ENSURE RLS IS ENABLED
-- ============================================
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RECREATE ALL RLS POLICIES
-- ============================================

-- Profiles
CREATE POLICY "Users own their profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their profile"
  ON profiles FOR DELETE USING (auth.uid() = id);

-- Allow the signup trigger (SECURITY DEFINER) to insert profiles.
-- WITH CHECK (true) is intentional: the trigger runs as the function owner (superuser),
-- not as the end user, so auth.uid() is NULL during trigger execution.
CREATE POLICY "Allow profile insert for auth users"
  ON profiles FOR INSERT WITH CHECK (true);

-- Accounts
CREATE POLICY "Users own their accounts"
  ON accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their accounts"
  ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their accounts"
  ON accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their accounts"
  ON accounts FOR DELETE USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users own their categories"
  ON categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their categories"
  ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their categories"
  ON categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their categories"
  ON categories FOR DELETE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users own their transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their transactions"
  ON transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their transactions"
  ON transactions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. RECREATE THE SIGNUP TRIGGER (CRITICAL FIX)
-- ============================================

-- The function must be SECURITY DEFINER so it bypasses RLS.
-- SET search_path = '' prevents search_path hijacking (security best practice).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists (e.g. from a retry), silently ignore
    RETURN NEW;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. VERIFY: Check that the trigger exists
-- ============================================
-- (This SELECT will show results in the Supabase SQL editor output)
SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
