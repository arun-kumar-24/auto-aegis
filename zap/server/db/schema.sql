-- ============================================================
-- ZAP Database Schema
-- Run: node db/migrate.js
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- ENUM: Order Status
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    );
  END IF;
END
$$;

-- ────────────────────────────────────────────────────────────
-- 1. CATEGORIES (no dependencies)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 2. USERS (renamed from 'user' — reserved keyword in PG)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  address        TEXT,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. WALLET (one per user, auto-created via trigger)
--    PK is user_id — one wallet per user
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  money       DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Trigger function: auto-create wallet with ₹0.00 on user insert
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallet (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then re-create (safe for re-runs)
DROP TRIGGER IF EXISTS trigger_create_wallet ON users;
CREATE TRIGGER trigger_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_new_user();

-- ────────────────────────────────────────────────────────────
-- 4. PRODUCTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(255) NOT NULL,
  price        DECIMAL(10, 2) NOT NULL,
  stock        INTEGER NOT NULL,
  category_id  UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 5. CART
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 6. ORDERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount  DECIMAL(10, 2) NOT NULL,
  status        order_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 7. ORDER_ITEMS (composite PK: order_id + product_id)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL,
  price       DECIMAL(10, 2) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (order_id, product_id)
);

-- ============================================================
-- DONE 🎉
-- ============================================================
