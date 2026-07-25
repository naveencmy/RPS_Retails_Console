-- ============================================================
-- RPS Retail POS - Complete Database Schema
-- PostgreSQL 14+
-- ============================================================

BEGIN;

-- ── EXTENSIONS ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── INVOICE NUMBER SEQUENCE ─────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1001;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'worker'
                CHECK (role IN ('owner','manager','worker','cashier')),
  active        BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  sku           VARCHAR(100),
  category      VARCHAR(100),
  reorder_level INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name     ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku      ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ============================================================
-- 3. PRODUCT UNITS (pricing per unit)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_units (
  id                SERIAL PRIMARY KEY,
  product_id        INTEGER      NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_name         VARCHAR(50)  NOT NULL,
  conversion_factor NUMERIC(10,4) NOT NULL DEFAULT 1,
  barcode           VARCHAR(100) UNIQUE,
  mrp               NUMERIC(12,2) NOT NULL DEFAULT 0,
  purchase_rate     NUMERIC(12,2) NOT NULL DEFAULT 0,
  sales_rate        NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_percent       NUMERIC(5,2)  NOT NULL DEFAULT 0,
  updated_by        INTEGER      REFERENCES users(id),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_rates_positive CHECK (
    purchase_rate >= 0 AND sales_rate >= 0 AND mrp >= 0
  )
);

CREATE INDEX IF NOT EXISTS idx_pu_product   ON product_units(product_id);
CREATE INDEX IF NOT EXISTS idx_pu_barcode   ON product_units(barcode);

-- ============================================================
-- 4. PARTIES (customers & suppliers)
-- ============================================================
CREATE TABLE IF NOT EXISTS parties (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  phone         VARCHAR(30)  NOT NULL,
  type          VARCHAR(20)  NOT NULL CHECK (type IN ('customer','supplier')),
  credit_limit  NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parties_name ON parties(name);
CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(type);

-- ============================================================
-- 5. INVOICES (sales + purchases + returns)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id              SERIAL PRIMARY KEY,
  invoice_number  VARCHAR(30)  NOT NULL DEFAULT ('INV-' || nextval('invoice_seq')),
  type            VARCHAR(20)  NOT NULL CHECK (type IN ('sale','purchase','sale_return','purchase_return')),
  party_id        INTEGER      REFERENCES parties(id) ON DELETE SET NULL,
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax             NUMERIC(12,2) NOT NULL DEFAULT 0,
  grand_total     NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by      INTEGER      REFERENCES users(id),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_number  ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_inv_type    ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_inv_party   ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_inv_date    ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_inv_created ON invoices(created_by);

-- ============================================================
-- 6. INVOICE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id              SERIAL PRIMARY KEY,
  invoice_id      INTEGER      NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_unit_id INTEGER      NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
  quantity        NUMERIC(12,2) NOT NULL CHECK (quantity != 0),
  rate            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ii_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_ii_product ON invoice_items(product_unit_id);

-- ============================================================
-- 7. STOCK MOVEMENTS (source of truth for inventory)
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id              SERIAL PRIMARY KEY,
  product_unit_id INTEGER      NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
  quantity        NUMERIC(12,2) NOT NULL,
  movement_type   VARCHAR(30)  NOT NULL
                  CHECK (movement_type IN (
                    'purchase','sale','sale_return','purchase_return','adjustment'
                  )),
  reference_id    INTEGER,
  created_by      INTEGER      REFERENCES users(id),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sm_product  ON stock_movements(product_unit_id);
CREATE INDEX IF NOT EXISTS idx_sm_type     ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_sm_date     ON stock_movements(created_at);

-- ============================================================
-- 8. PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id              SERIAL PRIMARY KEY,
  invoice_id      INTEGER      NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_method  VARCHAR(20)  NOT NULL CHECK (payment_method IN ('cash','upi','credit','card','bank_transfer')),
  amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pay_invoice ON payments(invoice_id);

-- ============================================================
-- 9. LEDGER ENTRIES (party-wise accounting)
-- ============================================================
CREATE TABLE IF NOT EXISTS ledger_entries (
  id            SERIAL PRIMARY KEY,
  party_id      INTEGER      NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  invoice_id    INTEGER      REFERENCES invoices(id) ON DELETE SET NULL,
  entry_type    VARCHAR(10)  NOT NULL CHECK (entry_type IN ('debit','credit')),
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  description   TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_le_party    ON ledger_entries(party_id);
CREATE INDEX IF NOT EXISTS idx_le_invoice  ON ledger_entries(invoice_id);
CREATE INDEX IF NOT EXISTS idx_le_type     ON ledger_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_le_date     ON ledger_entries(created_at);

-- ============================================================
-- 10. SALES DRAFTS (quick sale / hold)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_drafts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER      NOT NULL REFERENCES users(id),
  data       JSONB        NOT NULL DEFAULT '{}',
  status     VARCHAR(20)  NOT NULL DEFAULT 'open'
             CHECK (status IN ('open','closed')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sd_user   ON sales_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_sd_status ON sales_drafts(status);

-- ============================================================
-- HELPER FUNCTION: Invoice number generator
-- ============================================================
CREATE OR REPLACE FUNCTION generate_invoice_number(type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  seq_val BIGINT;
BEGIN
  CASE type
    WHEN 'sale'           THEN prefix := 'SAL';
    WHEN 'purchase'       THEN prefix := 'PUR';
    WHEN 'sale_return'    THEN prefix := 'SRT';
    WHEN 'purchase_return' THEN prefix := 'PRT';
    ELSE                       prefix := 'INV';
  END CASE;

  seq_val := nextval('invoice_seq');
  RETURN prefix || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- HELPER FUNCTION: Current stock for a product_unit
-- ============================================================
CREATE OR REPLACE FUNCTION get_stock(p_unit_id INTEGER)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(quantity), 0) FROM stock_movements WHERE product_unit_id = p_unit_id;
$$ LANGUAGE sql STABLE;

COMMIT;
