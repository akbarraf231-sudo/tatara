# Tatara Bakery - Production Backend Architecture

## 🎯 Overview

This is a production-ready Supabase (PostgreSQL) backend for a bakery online ordering system designed to:
- ✅ Prevent duplicate orders (idempotency)
- ✅ Prevent stock overselling (race condition safety)
- ✅ Handle concurrent orders efficiently
- ✅ Keep bookkeeping simple

---

## 🏗️ Database Design

### Core Tables

```
products
  ├── id (UUID)
  ├── name
  ├── description
  ├── image_url
  └── status (active/inactive/discontinued)

variants
  ├── id (UUID)
  ├── product_id (FK → products)
  ├── name
  ├── price
  ├── stock_conversion (how many base units per variant)
  └── status (active/inactive)

stock (⭐ SINGLE SOURCE OF TRUTH)
  ├── id (UUID)
  ├── variant_id (FK → variants, UNIQUE)
  ├── quantity_available
  ├── quantity_reserved
  └── last_updated

orders
  ├── id (UUID)
  ├── idempotency_key (UNIQUE) ⭐ PREVENT DUPLICATES
  ├── customer_name
  ├── whatsapp
  ├── pickup_date
  ├── total_amount
  ├── status (pending/confirmed/completed/cancelled)
  └── timestamps

order_items
  ├── id (BIGSERIAL)
  ├── order_id (FK → orders)
  ├── variant_id (FK → variants)
  ├── quantity
  ├── unit_price (snapshot at order time)
  └── subtotal

transactions (bookkeeping)
  ├── id (UUID)
  ├── order_id (FK → orders)
  ├── type (income/expense)
  ├── amount
  └── description
```

---

## 🔐 Race Condition Safety

### The Problem
Without proper locking, two concurrent orders can both see sufficient stock and oversell:

```
Thread 1: SELECT stock = 10
Thread 2: SELECT stock = 10
Thread 1: UPDATE stock = 10 - 5 = 5 ✓
Thread 2: UPDATE stock = 5 - 8 = -3 ✗ INVALID!
```

### The Solution: Pessimistic Locking

Inside `place_order()` RPC function:
```sql
SELECT quantity_available
FROM stock
WHERE variant_id = ?
FOR UPDATE;  -- ⭐ Lock row until transaction ends
```

With locking:
```
Thread 1: LOCK stock row, SELECT = 10
Thread 2: WAIT (blocked by Thread 1's lock)
Thread 1: UPDATE stock = 5, UNLOCK
Thread 2: LOCK stock row, SELECT = 5
Thread 2: Check: 5 >= 8? NO → ERROR (no overselling!)
```

---

## 🔄 Idempotency

### The Problem
Without idempotency, network retries create duplicate orders:

```
Frontend: Click "Place Order"
  → Send HTTP request
  → Network timeout
Frontend: Retry (user clicks again)
  → Send same request
  → Creates ANOTHER order (bad!)
```

### The Solution: Idempotency Key

Each order attempt generates a **unique UUID** before sending to backend:

```javascript
const idempotencyKey = crypto.randomUUID();
// This key is included in request
// If network fails and retry uses SAME key:
// Backend recognizes it's the same order and returns existing order_id
```

Flow:
```
Request 1: idempotency_key = "uuid-123" → Create order, return order_id
Network timeout/retry...
Request 2: idempotency_key = "uuid-123" → Check: already exists? YES → return same order_id
```

---

## 📊 RPC Function: place_order()

### Parameters
```javascript
{
  p_customer_name: "Budi Santoso",
  p_whatsapp: "+6281234567890",
  p_pickup_date: "2026-05-01",
  p_items: [
    { variant_id: "uuid-1", quantity: 2 },
    { variant_id: "uuid-2", quantity: 1 }
  ],
  p_idempotency_key: "550e8400-e29b-41d4-a716-446655440000",
  p_notes: "Slice the cake into 8 pieces"
}
```

### Execution Flow

1. **Idempotency Check**
   - Does `idempotency_key` already exist?
   - If YES → return existing order_id (no duplicate)

2. **Input Validation**
   - Check items not empty
   - Check pickup_date not in past

3. **Create Order** (status = pending)
   - Insert order with all fields
   - Get order_id

4. **Process Each Item**
   - Lock stock row (`FOR UPDATE`)
   - Validate variant exists and is active
   - Calculate required stock: `quantity × stock_conversion`
   - Check: `available_stock >= required_stock`?
   - If NO → throw error (entire transaction rolls back)
   - If YES → deduct stock
   - Insert order_item with unit_price snapshot

5. **Confirm Order**
   - Update order status = confirmed
   - Set confirmed_at timestamp
   - Calculate total_amount

6. **Record Transaction**
   - Insert income record for bookkeeping

7. **Return Success**
   - Return order_id and total_amount

### Error Handling
Any error → entire transaction rolls back
- Stock NOT deducted
- Order NOT created
- No partial data

---

## 🚀 Performance Optimizations

### Indexes
```sql
products(status)
variants(product_id, status)
stock(variant_id) -- UNIQUE constraint
orders(idempotency_key) -- UNIQUE
orders(created_at, status)
order_items(order_id, variant_id)
transactions(order_id, type, created_at)
```

### Query Efficiency
- ✅ No SELECT * (only needed columns)
- ✅ Minimal joins (inside RPC, data is denormalized)
- ✅ Unit prices snapshotted (no price lookup during confirmation)
- ✅ Single stock table (no need to join)

### Concurrency
- ✅ Row-level locking (fine-grained, not table-level)
- ✅ Short transactions (lock held only during RPC execution)
- ✅ No deadlocks (always lock in same order: stock table)

---

## 📝 Example: place_order Request

### HTTP Request
```bash
curl -X POST https://nqhsgexvhqcyezjmmyzj.supabase.co/rest/v1/rpc/place_order \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_customer_name": "Budi Santoso",
    "p_whatsapp": "+6281234567890",
    "p_pickup_date": "2026-05-01",
    "p_items": [
      {
        "variant_id": "550e8400-e29b-41d4-a716-446655440001",
        "quantity": 2
      }
    ],
    "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
    "p_notes": null
  }'
```

### Success Response
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order_id": "550e8400-e29b-41d4-a716-446655440099",
  "total_amount": 100000,
  "item_count": 1,
  "is_duplicate": false
}
```

### Duplicate Response (same idempotency_key)
```json
{
  "success": true,
  "message": "Order already exists (idempotent response)",
  "order_id": "550e8400-e29b-41d4-a716-446655440099",
  "is_duplicate": true
}
```

### Error Response
```json
{
  "success": false,
  "error": "Insufficient stock for variant...",
  "error_code": "P0001"
}
```

---

## 💾 Stock Management

### Initialization
```sql
-- After creating variants, initialize stock
INSERT INTO stock (variant_id, quantity_available, quantity_reserved)
SELECT id, 100, 0 FROM variants;
```

### Adjustments (manual, admin only)
```sql
-- Add stock
UPDATE stock
SET quantity_available = quantity_available + 50
WHERE variant_id = 'uuid-1';

-- Remove stock (damage, expiry)
UPDATE stock
SET quantity_available = quantity_available - 5
WHERE variant_id = 'uuid-1';

-- Never go below 0 (enforced by CHECK constraint)
```

---

## 📊 Reports & Analytics

### Daily Sales
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_orders,
  SUM(total_amount) as revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE status = 'confirmed'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Stock Status
```sql
SELECT
  v.name,
  p.name as product,
  s.quantity_available,
  s.quantity_reserved,
  (s.quantity_available + s.quantity_reserved) as total
FROM stock s
JOIN variants v ON s.variant_id = v.id
JOIN products p ON v.product_id = p.id
WHERE v.status = 'active'
ORDER BY s.quantity_available ASC;
```

### Revenue by Product
```sql
SELECT
  p.name,
  SUM(oi.subtotal) as revenue,
  SUM(oi.quantity) as units_sold
FROM order_items oi
JOIN variants v ON oi.variant_id = v.id
JOIN products p ON v.product_id = p.id
GROUP BY p.id, p.name
ORDER BY revenue DESC;
```

---

## ⚠️ Important Notes

1. **Stock Conversion**: Used for variants that represent multiple base units
   - Example: Product = "Croissant", Variant = "Box of 6 croissants"
   - stock_conversion = 6 means 1 box uses 6 base units of stock

2. **Price Snapshot**: order_items.unit_price is immutable
   - Prevents confusion if variant price changes later
   - Historical accuracy for invoices

3. **Idempotency Key Generation**:
   - Frontend generates UUID (not server)
   - Must be unique per order attempt
   - Persists across retries

4. **Status Flow**:
   - pending → confirmed (on successful RPC call)
   - confirmed → completed (manual update by admin)
   - Any → cancelled (manual update by admin)

5. **Reserved Stock**: Currently not used but available for:
   - Future: pre-order system
   - Future: reservation before payment

---

## 🔗 Integration Checklist

- [ ] Run migration 001_bakery_schema.sql
- [ ] Run migration 002_place_order_rpc.sql
- [ ] Create admin panel for:
  - [ ] Stock adjustments
  - [ ] Order status updates
  - [ ] Revenue reports
- [ ] Implement frontend:
  - [ ] Generate idempotency key per order
  - [ ] Call place_order RPC
  - [ ] Handle retries with same key
  - [ ] Show order confirmation
- [ ] Load test with k6 script
- [ ] Setup monitoring/alerting for:
  - [ ] RPC error rates
  - [ ] Stock consistency
  - [ ] Order processing time
