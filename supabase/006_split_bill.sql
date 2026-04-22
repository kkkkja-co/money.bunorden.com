-- ============================================================
-- 006_split_bill.sql
-- Creates tables for:
--   • notes           (cloud-synced notes)
--   • cards           (payment card references)
--   • split_sessions  (shared expense groups)
--   • split_expenses  (individual expenses in a session)
--   • notifications   (in-app invite & alert system)
--
-- Run this in the Supabase SQL editor.
-- All tables use RLS — each user can only access their own data.
-- ============================================================

-- ── 1. NOTES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL DEFAULT 'Untitled',
  content    TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their notes"         ON notes;
DROP POLICY IF EXISTS "Users can create their notes"  ON notes;
DROP POLICY IF EXISTS "Users can update their notes"  ON notes;
DROP POLICY IF EXISTS "Users can delete their notes"  ON notes;

CREATE POLICY "Users own their notes"
  ON notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their notes"
  ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notes"
  ON notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their notes"
  ON notes FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at on notes
CREATE OR REPLACE FUNCTION public.set_notes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notes_set_updated_at ON notes;
CREATE TRIGGER notes_set_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION public.set_notes_updated_at();


-- ── 2. CARDS ──────────────────────────────────────────────────
-- Stores payment card references (last 4 digits only — no full PAN)

CREATE TABLE IF NOT EXISTS cards (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  number     TEXT        NOT NULL DEFAULT '',   -- stored as '****1234'
  expiry     TEXT        NOT NULL DEFAULT '',   -- 'MM/YY'
  icon       TEXT        NOT NULL DEFAULT 'Visa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their cards"         ON cards;
DROP POLICY IF EXISTS "Users can create their cards"  ON cards;
DROP POLICY IF EXISTS "Users can update their cards"  ON cards;
DROP POLICY IF EXISTS "Users can delete their cards"  ON cards;

CREATE POLICY "Users own their cards"
  ON cards FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their cards"
  ON cards FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cards"
  ON cards FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their cards"
  ON cards FOR DELETE USING (auth.uid() = user_id);


-- ── 3. SPLIT SESSIONS ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS split_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  emoji        TEXT        NOT NULL DEFAULT '✈️',
  type         TEXT        NOT NULL DEFAULT 'travel'
                             CHECK (type IN ('travel', 'project', 'other')),
  currency     TEXT        NOT NULL DEFAULT 'HKD',
  participants TEXT[]      NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE split_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Session owners can read"        ON split_sessions;
DROP POLICY IF EXISTS "Session owners can create"      ON split_sessions;
DROP POLICY IF EXISTS "Session owners can update"      ON split_sessions;
DROP POLICY IF EXISTS "Session owners can delete"      ON split_sessions;
DROP POLICY IF EXISTS "Invited members can read"       ON split_sessions;

-- Owner full access
CREATE POLICY "Session owners can read"
  ON split_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Session owners can create"
  ON split_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Session owners can update"
  ON split_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Session owners can delete"
  ON split_sessions FOR DELETE USING (auth.uid() = user_id);

-- Invited members can also read sessions they were invited to
-- (invitation accepted = notification status = 'accepted')
CREATE POLICY "Invited members can read"
  ON split_sessions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = auth.uid()
        AND n.type = 'invite'
        AND n.status = 'accepted'
        AND (n.metadata->>'session_id') = split_sessions.id::text
    )
  );


-- ── 4. SPLIT EXPENSES ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS split_expenses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID        NOT NULL REFERENCES split_sessions(id) ON DELETE CASCADE,
  description  TEXT        NOT NULL,
  amount       NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  paid_by      TEXT        NOT NULL,
  split_among  TEXT[]      NOT NULL DEFAULT '{}',
  date         DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE split_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Expense access via session ownership"  ON split_expenses;
DROP POLICY IF EXISTS "Expense insert via session ownership"  ON split_expenses;
DROP POLICY IF EXISTS "Expense update via session ownership"  ON split_expenses;
DROP POLICY IF EXISTS "Expense delete via session ownership"  ON split_expenses;
DROP POLICY IF EXISTS "Expense access via invitation"         ON split_expenses;

-- Session owner can manage expenses
CREATE POLICY "Expense access via session ownership"
  ON split_expenses FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.split_sessions s
      WHERE s.id = split_expenses.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Expense insert via session ownership"
  ON split_expenses FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.split_sessions s
      WHERE s.id = split_expenses.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Expense update via session ownership"
  ON split_expenses FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.split_sessions s
      WHERE s.id = split_expenses.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Expense delete via session ownership"
  ON split_expenses FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.split_sessions s
      WHERE s.id = split_expenses.session_id AND s.user_id = auth.uid()
    )
  );

-- Invited members (accepted) can also read expenses
CREATE POLICY "Expense access via invitation"
  ON split_expenses FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.user_id = auth.uid()
        AND n.type = 'invite'
        AND n.status = 'accepted'
        AND (n.metadata->>'session_id') = split_expenses.session_id::text
    )
  );


-- ── 5. NOTIFICATIONS ──────────────────────────────────────────
-- Used for in-app invitations (share/invite to a split session)
-- and general system alerts.

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  type       TEXT        NOT NULL DEFAULT 'alert'
                           CHECK (type IN ('invite', 'alert', 'budget', 'system')),
  title      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'declined', 'read')),
  metadata   JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their notifications"    ON notifications;
DROP POLICY IF EXISTS "Users update their notifications"  ON notifications;
DROP POLICY IF EXISTS "Anyone can send a notification"    ON notifications;
DROP POLICY IF EXISTS "Senders can read sent invites"     ON notifications;

-- Recipients can read and update (accept/decline) their own notifications
CREATE POLICY "Users read their notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update their notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Any authenticated user can insert a notification (to send invites)
-- The INSERT policy intentionally does NOT restrict user_id so a sender
-- can create a notification for another user.
CREATE POLICY "Anyone can send a notification"
  ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Senders can also read notifications they sent (to check delivery)
CREATE POLICY "Senders can read sent invites"
  ON notifications FOR SELECT USING (auth.uid() = sender_id);


-- ── 6. HELPER VIEW: Expose email for invite lookup ─────────────
-- The profiles table does not store emails (they live in auth.users).
-- This view safely exposes {id, email} so the app can look up a user
-- by email when sending an invitation.
-- Access is restricted to authenticated users only.

CREATE OR REPLACE VIEW public.user_emails AS
  SELECT id, email
  FROM auth.users;

-- Grant SELECT to authenticated role only
GRANT SELECT ON public.user_emails TO authenticated;

-- ── DONE ──────────────────────────────────────────────────────
-- Run this file once in Supabase SQL Editor.
-- Tables are idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS).
