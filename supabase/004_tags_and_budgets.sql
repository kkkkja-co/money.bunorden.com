-- Tags on transactions (comma-separated in UI; stored as text array)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_tags_length'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_tags_length
      CHECK (cardinality(tags) <= 20);
  END IF;
END $$;

-- Monthly budgets: category_id NULL = overall expense cap for that month
CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  month_year  DATE NOT NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency    TEXT NOT NULL DEFAULT 'HKD',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT budgets_month_starts_first
    CHECK (EXTRACT(DAY FROM month_year)::INTEGER = 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_category_month
  ON budgets (user_id, category_id, month_year)
  WHERE category_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS budgets_user_month_overall
  ON budgets (user_id, month_year)
  WHERE category_id IS NULL;

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their budgets" ON budgets;
DROP POLICY IF EXISTS "Users can create their budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their budgets" ON budgets;

CREATE POLICY "Users own their budgets"
  ON budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their budgets"
  ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their budgets"
  ON budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their budgets"
  ON budgets FOR DELETE USING (auth.uid() = user_id);
