-- ============================================================================
-- TATARA BAKERY - Production-Ready PostgreSQL Schema
-- ============================================================================
-- Safe from race conditions, duplicate orders, and stock inconsistencies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PRODUCTS TABLE
-- ============================================================================
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

-- ============================================================================
-- 2. VARIANTS TABLE
-- ============================================================================
-- Each product can have variants (e.g., size, flavor)
-- Each variant has its own price and stock conversion
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  stock_conversion INT NOT NULL DEFAULT 1 CHECK (stock_conversion > 0),
  -- stock_conversion: how many units of base stock this variant uses
  -- e.g., if base unit is "piece", a "box of 6" would have stock_conversion = 6
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product_id ON variants(product_id);
CREATE INDEX idx_variants_status ON variants(status);

-- ============================================================================
-- 3. STOCK TABLE
-- ============================================================================
-- Single source of truth for inventory
-- Using pessimistic locking (FOR UPDATE) to prevent race conditions
CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL UNIQUE REFERENCES variants(id) ON DELETE CASCADE,
  quantity_available INT NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Reserve adalah untuk orders yang pending/unconfirmed
  CONSTRAINT valid_stock CHECK (quantity_available + quantity_reserved >= 0)
);

CREATE INDEX idx_stock_variant_id ON stock(variant_id);

-- ============================================================================
-- 4. ORDERS TABLE
-- ============================================================================
-- Main orders table with idempotency key
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  -- Prevent duplicate orders - frontend must generate UUID per order attempt
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
CREATE INDEX idx_orders_idempotency_key ON orders(idempotency_key);

-- ============================================================================
-- 5. ORDER_ITEMS TABLE
-- ============================================================================
-- Line items for each order
-- Snapshot of price at order time (not current price)
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES variants(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price > 0),
  -- unit_price: price of variant at order time
  subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);

-- ============================================================================
-- 6. TRANSACTIONS TABLE
-- ============================================================================
-- Simple bookkeeping: income from orders, expenses (if needed)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================================================
-- 7. HELPER: Auto-update updated_at columns
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_variants_updated_at
BEFORE UPDATE ON variants
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- 8. SAMPLE DATA (for testing)
-- ============================================================================
INSERT INTO products (name, description, image_url, status) VALUES
  ('Sourdough Bread', 'Artisan sourdough made fresh daily', 'https://via.placeholder.com/300', 'active'),
  ('Croissant', 'Buttery French croissants', 'https://via.placeholder.com/300', 'active'),
  ('Chocolate Cake', 'Rich chocolate layer cake', 'https://via.placeholder.com/300', 'active');

INSERT INTO variants (product_id, name, price, stock_conversion, status)
SELECT id, 'Regular', 50000, 1, 'active' FROM products WHERE name = 'Sourdough Bread'
UNION ALL
SELECT id, 'Regular', 25000, 1, 'active' FROM products WHERE name = 'Croissant'
UNION ALL
SELECT id, 'Whole Cake', 150000, 1, 'active' FROM products WHERE name = 'Chocolate Cake'
UNION ALL
SELECT id, 'Slice (4pcs)', 45000, 1, 'active' FROM products WHERE name = 'Chocolate Cake';

-- Initialize stock for all variants
INSERT INTO stock (variant_id, quantity_available, quantity_reserved)
SELECT id, 100, 0 FROM variants;
