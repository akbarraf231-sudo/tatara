-- ============================================================================
-- TATARA BAKERY - SETUP DATABASE LENGKAP (JALANKAN SEMUA SEKALIGUS)
-- ============================================================================
-- Buka Supabase → SQL Editor → New Query → Paste seluruh file ini → Run
-- ============================================================================

-- ============================================================================
-- BAGIAN 1: SCHEMA (TABLES)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables jika ada (hati-hati: ini akan menghapus data!)
-- Hapus baris-baris ini jika ingin keep data lama
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles (role-based access)
-- Setiap user yang sign up akan dapat profile otomatis (default role = 'customer')
-- Untuk jadikan user admin, jalankan di SQL Editor:
--   UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'kerjadigital231@gmail.com');
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill existing auth.users into profiles
INSERT INTO profiles (id, email, role)
SELECT id, email, 'customer' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Helper: cek apakah current user adalah admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_status ON products(status);

-- Variants
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  stock_conversion INT NOT NULL DEFAULT 1 CHECK (stock_conversion > 0),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_variants_product_id ON variants(product_id);
CREATE INDEX idx_variants_status ON variants(status);

-- Stock
CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL UNIQUE REFERENCES variants(id) ON DELETE CASCADE,
  quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_stock_variant_id ON stock(variant_id);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  pickup_date DATE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date);

-- Order Items
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES variants(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
  subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================================================
-- BAGIAN 2: RPC FUNCTION (place_order)
-- ============================================================================

CREATE OR REPLACE FUNCTION place_order(
  p_customer_name TEXT,
  p_whatsapp TEXT,
  p_pickup_date DATE,
  p_items JSONB,
  p_idempotency_key TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_variant_id UUID;
  v_quantity INT;
  v_variant_price DECIMAL(10, 2);
  v_stock_conversion INT;
  v_required_stock INT;
  v_available_stock INT;
  v_subtotal DECIMAL(12, 2);
  v_total_amount DECIMAL(12, 2) := 0;
  v_existing_order_id UUID;
BEGIN
  -- Idempotency check
  SELECT id INTO v_existing_order_id FROM orders WHERE idempotency_key = p_idempotency_key LIMIT 1;
  IF v_existing_order_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'order_id', v_existing_order_id, 'is_duplicate', true);
  END IF;

  -- Validation
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items in order';
  END IF;
  IF p_pickup_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Pickup date cannot be in the past';
  END IF;

  -- Create order
  INSERT INTO orders (idempotency_key, customer_name, whatsapp, pickup_date, status, notes, total_amount)
  VALUES (p_idempotency_key, p_customer_name, p_whatsapp, p_pickup_date, 'pending', p_notes, 0)
  RETURNING id INTO v_order_id;

  -- Process items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    SELECT price, stock_conversion INTO v_variant_price, v_stock_conversion
    FROM variants WHERE id = v_variant_id AND status = 'active';

    IF v_variant_price IS NULL THEN
      RAISE EXCEPTION 'Variant % not found', v_variant_id;
    END IF;

    v_required_stock := v_quantity * v_stock_conversion;

    SELECT quantity_available INTO v_available_stock
    FROM stock WHERE variant_id = v_variant_id FOR UPDATE;

    IF v_available_stock < v_required_stock THEN
      RAISE EXCEPTION 'Insufficient stock for variant %', v_variant_id;
    END IF;

    UPDATE stock SET quantity_available = quantity_available - v_required_stock,
      last_updated = CURRENT_TIMESTAMP WHERE variant_id = v_variant_id;

    v_subtotal := v_quantity * v_variant_price;
    v_total_amount := v_total_amount + v_subtotal;

    INSERT INTO order_items (order_id, variant_id, quantity, unit_price, subtotal)
    VALUES (v_order_id, v_variant_id, v_quantity, v_variant_price, v_subtotal);
  END LOOP;

  -- Confirm order
  UPDATE orders SET total_amount = v_total_amount, status = 'confirmed',
    confirmed_at = CURRENT_TIMESTAMP WHERE id = v_order_id;

  -- Record transaction
  INSERT INTO transactions (order_id, type, amount, description)
  VALUES (v_order_id, 'income', v_total_amount, 'Order from ' || p_customer_name);

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id,
    'total_amount', v_total_amount, 'is_duplicate', false);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION place_order TO authenticated, anon;

-- ============================================================================
-- BAGIAN 3: ROW LEVEL SECURITY (Akses untuk admin yang login)
-- ============================================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: user bisa baca profile-nya sendiri, admin bisa baca semua
CREATE POLICY "self_read_profile"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_read_profile" ON profiles FOR SELECT USING (is_admin());

-- Public bisa READ produk aktif (untuk halaman menu di website)
CREATE POLICY "public_read_products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "public_read_variants" ON variants FOR SELECT USING (status = 'active');
CREATE POLICY "public_read_stock"    ON stock    FOR SELECT USING (true);

-- Admin (role=admin) bisa SEMUA aksi
CREATE POLICY "admin_all_products"     ON products     FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_variants"     ON variants     FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_stock"        ON stock        FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_orders"       ON orders       FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_order_items"  ON order_items  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_all_transactions" ON transactions FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================================
-- BAGIAN 4: SAMPLE DATA (untuk testing)
-- ============================================================================

INSERT INTO products (name, description, image_url, status) VALUES
  ('Croissant Butter', 'Croissant mentega khas Prancis', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 'active'),
  ('Sourdough Bread', 'Roti sourdough artisan', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 'active'),
  ('Brownies Coklat', 'Brownies coklat fudgy', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', 'active');

INSERT INTO variants (product_id, name, price, stock_conversion, status)
SELECT id, 'Regular', 25000, 1, 'active' FROM products WHERE name = 'Croissant Butter'
UNION ALL
SELECT id, 'Regular', 50000, 1, 'active' FROM products WHERE name = 'Sourdough Bread'
UNION ALL
SELECT id, 'Box (6 pcs)', 80000, 1, 'active' FROM products WHERE name = 'Brownies Coklat';

INSERT INTO stock (variant_id, quantity_available, quantity_reserved)
SELECT id, 20, 0 FROM variants;

-- ============================================================================
-- BAGIAN 5: PROMOTE USER MENJADI ADMIN
-- ============================================================================
-- Setelah membuat user di Authentication → Users (kerjadigital231@gmail.com),
-- jalankan query berikut untuk memberi role admin:

UPDATE profiles
SET role = 'admin'
WHERE email = 'kerjadigital231@gmail.com';

-- Verifikasi:
-- SELECT email, role FROM profiles WHERE role = 'admin';

-- ============================================================================
-- SELESAI! Buka /admin/login untuk masuk admin panel
-- ============================================================================
