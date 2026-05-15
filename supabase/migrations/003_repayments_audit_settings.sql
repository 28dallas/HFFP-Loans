-- ─────────────────────────────────────────
-- REPAYMENTS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS repayments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id     UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  note        TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_repayments" ON repayments
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Auto-update loans.amount_paid when repayment is inserted/deleted
CREATE OR REPLACE FUNCTION sync_loan_amount_paid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE loans
  SET amount_paid = (
    SELECT COALESCE(SUM(amount), 0) FROM repayments WHERE loan_id = COALESCE(NEW.loan_id, OLD.loan_id)
  )
  WHERE id = COALESCE(NEW.loan_id, OLD.loan_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_repayment_change
  AFTER INSERT OR DELETE ON repayments
  FOR EACH ROW EXECUTE FUNCTION sync_loan_amount_paid();

-- Auto-mark loan as Paid when amount_paid >= totalRepayable
CREATE OR REPLACE FUNCTION auto_mark_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount_paid >= (NEW.amount + (NEW.amount * NEW.interest_rate / 100)) THEN
    NEW.status := 'Paid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_loan_paid
  BEFORE UPDATE OF amount_paid ON loans
  FOR EACH ROW EXECUTE FUNCTION auto_mark_paid();

-- ─────────────────────────────────────────
-- AUDIT LOG TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  details     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_audit" ON audit_log
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────
-- SETTINGS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name              TEXT NOT NULL DEFAULT 'HFFP',
  monthly_interest_rate NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  processing_fee_rate   NUMERIC(5,2) NOT NULL DEFAULT 2.00,
  insurance_fee_rate    NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  ledger_fee            NUMERIC(10,2) NOT NULL DEFAULT 100.00,
  repayment_months      INT NOT NULL DEFAULT 6,
  max_loan_multiplier   NUMERIC(5,2) NOT NULL DEFAULT 3.00,
  updated_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_settings" ON settings
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Insert default settings row
INSERT INTO settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;
