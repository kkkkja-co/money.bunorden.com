-- Bills and Reminders

CREATE TABLE IF NOT EXISTS bills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '💳',
  due_day     INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  amount      NUMERIC(12,2),
  currency    TEXT NOT NULL DEFAULT 'HKD',
  auto_remind BOOLEAN NOT NULL DEFAULT true,
  remind_days INTEGER NOT NULL DEFAULT 3,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their bills" ON bills;
DROP POLICY IF EXISTS "Users can create their bills" ON bills;
DROP POLICY IF EXISTS "Users can update their bills" ON bills;
DROP POLICY IF EXISTS "Users can delete their bills" ON bills;

CREATE POLICY "Users own their bills"
  ON bills FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their bills"
  ON bills FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their bills"
  ON bills FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their bills"
  ON bills FOR DELETE USING (auth.uid() = user_id);
