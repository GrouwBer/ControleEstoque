-- ═══════════════════════════════════════
-- Projeto Loja v3.0 — Initial Schema
-- ═══════════════════════════════════════

-- Products
CREATE TABLE IF NOT EXISTS products (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sku           TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT DEFAULT '',
  category      TEXT DEFAULT '',
  condition     TEXT NOT NULL CHECK (condition IN ('New','Like New','Good','Fair','Poor')),
  cost_price    DECIMAL(12,2) NOT NULL DEFAULT 0,
  list_price    DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','sold')),
  image_url     TEXT DEFAULT '',
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, sku)
);

-- Carts (sale sessions)
CREATE TABLE IF NOT EXISTS carts (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name      TEXT DEFAULT '',
  buyer_phone     TEXT DEFAULT '',
  discount_type   TEXT NOT NULL DEFAULT 'none' CHECK (discount_type IN ('none','percent','fixed')),
  discount_value  DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  final_total     DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes           TEXT DEFAULT '',
  sale_notes      TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','finalized','cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id             BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  list_price_at_time  DECIMAL(12,2) NOT NULL,
  final_price         DECIMAL(12,2) NOT NULL DEFAULT 0
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT DEFAULT '',
  customer_email  TEXT DEFAULT '',
  reserved_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline        DATE,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','converted','cancelled'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_user_status ON products(user_id, status);
CREATE INDEX IF NOT EXISTS idx_products_user_sku ON products(user_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_user_category ON products(user_id, category);
CREATE INDEX IF NOT EXISTS idx_carts_user_status ON carts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_status ON reservations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_product ON reservations(product_id);

-- ═══════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own products" ON products;
CREATE POLICY "Users manage own products" ON products
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own carts" ON carts;
CREATE POLICY "Users manage own carts" ON carts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cart Items (cascaded through cart ownership)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own cart items" ON cart_items;
CREATE POLICY "Users manage own cart items" ON cart_items
  FOR ALL USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- Reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own reservations" ON reservations;
CREATE POLICY "Users manage own reservations" ON reservations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- Storage Bucket (run via supabase CLI)
-- ═══════════════════════════════════════
-- NOTE: The bucket creation is handled separately via supabase storage commands
