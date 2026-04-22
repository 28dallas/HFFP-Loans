-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ─────────────────────────────────────────
-- USERS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unique_no     TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  id_number     TEXT NOT NULL,
  phone_number  TEXT NOT NULL,
  ground        TEXT NOT NULL,
  total_shares  NUMERIC(12,2) DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate unique_no like HFFP001, HFFP002 ...
CREATE OR REPLACE FUNCTION generate_unique_no()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_seq FROM users;
  NEW.unique_no := 'HFFP' || LPAD(next_seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_unique_no
  BEFORE INSERT ON users
  FOR EACH ROW
  WHEN (NEW.unique_no IS NULL OR NEW.unique_no = '')
  EXECUTE FUNCTION generate_unique_no();

-- ─────────────────────────────────────────
-- LOANS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  loan_number      TEXT UNIQUE NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  interest_rate    NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date         DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'Pending'
                   CHECK (status IN ('Pending', 'Active', 'Paid', 'Overdue')),
  amount_paid      NUMERIC(12,2) DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate loan_number like LN-2025-001
CREATE OR REPLACE FUNCTION generate_loan_number()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INT;
  yr TEXT;
BEGIN
  yr := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO next_seq FROM loans
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  NEW.loan_number := 'LN-' || yr || '-' || LPAD(next_seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_loan_number
  BEFORE INSERT ON loans
  FOR EACH ROW
  WHEN (NEW.loan_number IS NULL OR NEW.loan_number = '')
  EXECUTE FUNCTION generate_loan_number();

-- ─────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW loans_with_balance AS
SELECT
  l.*,
  u.full_name,
  u.unique_no,
  u.ground,
  u.phone_number,
  ROUND((l.amount + (l.amount * l.interest_rate / 100)) - l.amount_paid, 2) AS outstanding_balance,
  (l.status = 'Active' AND l.due_date < CURRENT_DATE) AS is_overdue
FROM loans l
JOIN users u ON u.id = l.user_id;

-- ─────────────────────────────────────────
-- AUTO MARK OVERDUE FUNCTION + CRON
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_mark_overdue()
RETURNS void AS $$
BEGIN
  UPDATE loans
  SET status = 'Overdue'
  WHERE status = 'Active'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Schedule to run daily at midnight
SELECT cron.schedule(
  'auto-mark-overdue',
  '0 0 * * *',
  'SELECT auto_mark_overdue()'
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can access
CREATE POLICY "admin_all_users" ON users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_all_loans" ON loans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────
-- GLOBAL STATS RPC
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_members',      (SELECT COUNT(*) FROM users),
    'total_disbursed',    (SELECT COALESCE(SUM(amount), 0) FROM loans),
    'total_outstanding',  (SELECT COALESCE(SUM(ROUND((amount + (amount * interest_rate / 100)) - amount_paid, 2)), 0) FROM loans WHERE status IN ('Active', 'Overdue')),
    'loans_this_month',   (SELECT COUNT(*) FROM loans WHERE DATE_TRUNC('month', application_date) = DATE_TRUNC('month', CURRENT_DATE))
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
