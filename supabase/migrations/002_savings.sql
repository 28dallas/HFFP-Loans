-- ─────────────────────────────────────────
-- SAVINGS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  note        TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_savings" ON savings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
