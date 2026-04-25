# 🚀 Quick Start - Tatara Bakery Backend

Complete production-ready backend untuk bakery ordering system. Siap deploy ke Vercel + Supabase!

---

## 📦 Apa yang Sudah Dibangun

✅ **Database Schema** (PostgreSQL/Supabase)
- products, variants, stock, orders, order_items, transactions
- Single source of truth untuk inventory
- Indexes dan constraints untuk data integrity

✅ **RPC Function: place_order()**
- Idempotency prevention (prevent duplicate orders)
- Race condition safety (pessimistic locking)
- Atomic transactions (all-or-nothing)
- Stock validation (prevent overselling)

✅ **Concurrency Safety**
- `FOR UPDATE` locking pada stock table
- Prevents 2 orders from claiming same stock
- No negative stock allowed (CHECK constraint)

✅ **Frontend Integration**
- TypeScript order service dengan retry logic
- Generate idempotency key (unique per order attempt)
- Error handling dan type safety

✅ **Load Testing**
- k6 script untuk test 20 concurrent users
- Validates idempotency dan stock safety
- Performance benchmarking

✅ **Complete Documentation**
- BACKEND_ARCHITECTURE.md (system design)
- SETUP_BACKEND.md (installation steps)
- API_EXAMPLES.md (request/response examples)

---

## ⚡ 5-Minute Setup

### 1️⃣ Setup Supabase Database

**Option A: Copy-paste SQL (Easiest)**
1. Go to https://supabase.com/dashboard
2. SQL Editor → New Query
3. Copy content dari `supabase/migrations/001_bakery_schema.sql`
4. Run query
5. Repeat untuk `supabase/migrations/002_place_order_rpc.sql`

**Option B: Supabase CLI**
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 2️⃣ Get Supabase Credentials

Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key

(Sudah ada di `.env.local` Anda)

### 3️⃣ Test Backend

```bash
# Run dev server
npm run dev

# Test RPC di browser console (F12):
const { data, error } = await supabase.rpc('place_order', {
  p_customer_name: 'Test User',
  p_whatsapp: '+6281234567890',
  p_pickup_date: '2026-05-15',
  p_items: [{ variant_id: 'UUID', quantity: 1 }],
  p_idempotency_key: crypto.randomUUID()
});

console.log(data);
```

### 4️⃣ Deploy to Vercel

```bash
# Push ke GitHub (sudah dari main branch)
git push origin main

# Vercel akan auto-detect Next.js dan deploy
```

---

## 🏗️ Architecture

```
Frontend (Next.js)
    ↓
    └─→ orderService.ts
            ├─ generateIdempotencyKey() ← UUID per order
            └─ placeOrderWithRetry()    ← Retry logic
                    ↓
        Supabase REST API
            ↓
        place_order RPC Function
            ├─ Check idempotency_key (prevent duplicates)
            ├─ Lock stock row (FOR UPDATE)
            ├─ Validate & deduct stock
            ├─ Create order & items
            ├─ Record transaction
            └─ Return order_id
                    ↓
        Database ✅
        (stock decreased, order created)
```

---

## 📊 Database Tables

### Stock (⭐ Single Source of Truth)
```sql
-- Base unit (pieces)
quantity_available: 100
quantity_reserved: 0

-- When order comes:
FOR UPDATE; -- Lock row
SELECT quantity_available; -- Get 100
IF 100 >= required THEN
  UPDATE quantity_available = 100 - required;
```

### Orders
```
id: UUID (order_id)
idempotency_key: UNIQUE (prevent duplicates)
status: pending → confirmed → completed
total_amount: Calculated from items
created_at: timestamp
```

### Order Items (Snapshot)
```
order_id: FK to orders
variant_id: FK to variants
quantity: How many
unit_price: Price at order time (immutable)
subtotal: quantity × unit_price
```

---

## 🔐 Idempotency Example

### First Request (Place Order)
```json
{
  "p_customer_name": "Budi",
  "p_whatsapp": "+628123456789",
  "p_pickup_date": "2026-05-15",
  "p_items": [{"variant_id": "UUID", "quantity": 2}],
  "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "is_duplicate": false
}
```

### Retry Request (Same key, network timeout)
```json
{
  // Same payload
  "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:** (No new order created!)
```json
{
  "success": true,
  "order_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "is_duplicate": true
}
```

✨ **Same order_id returned!** Zero duplicates!

---

## 🚨 Race Condition Prevention

### Without locking (WRONG):
```
User A: SELECT stock=10
User B: SELECT stock=10
User A: UPDATE stock=5 (buy 5)
User B: UPDATE stock=-3 ✗ INVALID!
```

### With locking (CORRECT):
```
User A: LOCK stock, SELECT stock=10
User B: WAIT (locked by A)
User A: UPDATE stock=5, UNLOCK
User B: LOCK stock, SELECT stock=5
User B: IF 5 >= need? NO → ERROR (smart!)
```

**Our implementation:**
```sql
SELECT quantity_available
FROM stock
WHERE variant_id = ?
FOR UPDATE; -- ⭐ Prevents race conditions
```

---

## 📈 Load Testing

```bash
# Install k6
brew install k6  # macOS
# or npm install -g k6

# Run load test (20 users, 60 seconds)
export SUPABASE_URL=https://YOUR_PROJECT.supabase.co
export SUPABASE_ANON_KEY=YOUR_KEY
k6 run tests/load-test.k6.js

# Expected output:
# ✓ checks > 95%
# ✓ p(95) < 1000ms
# ✓ No stock overselling
# ✓ Idempotency verified
```

---

## 🔗 Integration Steps

### 1. Frontend Order Page
```typescript
import { generateIdempotencyKey, placeOrderWithRetry } from '@/lib/order-service'

export default function CheckoutPage() {
  const handleCheckout = async () => {
    const idempotencyKey = generateIdempotencyKey(); // Generate once
    
    const response = await placeOrderWithRetry({
      customer_name: 'Budi',
      whatsapp: '+628123456789',
      pickup_date: '2026-05-15',
      items: [{ variant_id: 'UUID', quantity: 2 }]
    }, idempotencyKey);

    if (response.success) {
      // ✅ Order placed!
      console.log('Order:', response.order_id);
      console.log('Total:', response.total_amount);
      // Redirect to confirmation page
    } else {
      // ❌ Show error
      console.error('Order failed:', response.error);
    }
  };
}
```

### 2. Admin Panel (Order Management)
```sql
-- View pending orders
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;

-- Update order status
UPDATE orders SET status = 'confirmed' WHERE id = 'ORDER_ID';

-- View revenue
SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURRENT_DATE;
```

### 3. Customer Notifications (Webhook)
```javascript
// After order confirmed, send WhatsApp:
// "Pesanan Anda #{order_id} siap di ambil tanggal {pickup_date}. Total: Rp {amount}"
```

---

## 📋 Checklist Before Deployment

- [ ] Database migrations run successfully
- [ ] Sample data inserted (3 products)
- [ ] RPC function callable from browser
- [ ] `.env.local` has correct credentials
- [ ] Dev server running locally
- [ ] Code pushed to GitHub (main branch)
- [ ] Load test passing (optional but recommended)
- [ ] Secrets removed from commits

---

## 🎯 What's Next

### Immediate (Required)
1. ✅ Setup Supabase database
2. ✅ Run migrations
3. ✅ Test RPC function
4. Deploy to Vercel

### Short Term (Nice to Have)
5. Build order page UI
6. Add payment integration
7. Setup WhatsApp notifications
8. Create admin dashboard

### Medium Term
9. Inventory analytics
10. Customer loyalty program
11. Multi-location support
12. API documentation for partners

---

## 🆘 Troubleshooting

**Q: RPC function not found**
A: Run `supabase/migrations/002_place_order_rpc.sql` again

**Q: Stock goes negative**
A: Check `FOR UPDATE` is in RPC function

**Q: Getting duplicate orders**
A: Verify idempotency_key is UNIQUE indexed

**Q: Load test fails**
A: Set VARIANT_IDS correctly in k6 script

---

## 📚 Documentation

- **BACKEND_ARCHITECTURE.md** - Deep dive into system design
- **SETUP_BACKEND.md** - Step-by-step installation
- **API_EXAMPLES.md** - Request/response examples
- **order-service.ts** - TypeScript integration

---

## ✨ Key Features

✅ **Race Condition Safe** - Pessimistic locking prevents overselling
✅ **Idempotent** - Retries don't create duplicate orders
✅ **Atomic** - All-or-nothing order placement
✅ **Fast** - Minimal queries, efficient indexes
✅ **Scalable** - Handles concurrent orders safely
✅ **Simple** - No microservices, no overengineering
✅ **Production Ready** - Tested, documented, deployable

---

## 🚀 Deploy Now

```bash
# You're already on main branch with all code committed
git push origin main

# Visit: https://vercel.com/new
# Import GitHub repo
# Add env variables
# Deploy!

# Website will be live at: tatara.vercel.app
```

---

## 💬 Questions?

Check the documentation files in `/docs/` folder for detailed explanations!
