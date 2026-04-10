-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  mode         TEXT NOT NULL DEFAULT 'simple' CHECK (mode IN ('simple','multi')),
  motion_enabled BOOLEAN NOT NULL DEFAULT false,
  dark_mode    BOOLEAN NOT NULL DEFAULT false,
  currency     TEXT NOT NULL DEFAULT 'HKD',
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts
CREATE TABLE accounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '💳',
  colour     TEXT NOT NULL DEFAULT '#007AFF',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Categories
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  name       TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '📁',
  colour     TEXT NOT NULL DEFAULT '#636366',
  type       TEXT NOT NULL CHECK (type IN ('expense','income')),
  archived   BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- Transactions
CREATE TABLE transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles ON DELETE CASCADE,
  account_id    UUID NOT NULL REFERENCES accounts ON DELETE RESTRICT,
  to_account_id UUID REFERENCES accounts ON DELETE RESTRICT,
  category_id   UUID REFERENCES categories ON DELETE SET NULL,
  type          TEXT NOT NULL CHECK (type IN ('expense','income','transfer')),
  amount        NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'HKD',
  date          DATE NOT NULL,
  note          TEXT CHECK (char_length(note) <= 280),
  recurring     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: enable on all tables
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users own their profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users own their accounts"
  ON accounts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their categories"
  ON categories FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their transactions"
  ON transactions FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
