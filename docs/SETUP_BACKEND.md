# Bakery Backend Setup Guide

Complete step-by-step guide to setup the production-ready Supabase backend.

---

## ✅ Prerequisites

- Supabase account (https://supabase.com)
- Node.js 18+ (for k6 testing)
- k6 installed (optional, for load testing)

---

## 🚀 Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - Name: `tatara-bakery`
   - Database Password: (save this safely)
   - Region: (choose closest to you)
4. Wait for project to be created (2-3 minutes)

---

## 📊 Step 2: Run Database Migrations

### Option A: Using Supabase Dashboard SQL Editor (Easiest)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire content of `supabase/migrations/001_bakery_schema.sql`
4. Paste into the query editor
5. Click **"Run"** (green button)
6. Wait for success message

Repeat for `supabase/migrations/002_place_order_rpc.sql`

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize (one time)
supabase init

# Link to your project
supabase link --project-ref your_project_ref

# Run migrations
supabase db push
```

---

## ✨ Step 3: Verify Setup

### Check Tables Created

In Supabase dashboard → **Table Editor**, verify:
- ✅ products
- ✅ variants
- ✅ stock
- ✅ orders
- ✅ order_items
- ✅ transactions

### Check RPC Function Created

In Supabase dashboard → **SQL Editor**, run:

```sql
SELECT proname FROM pg_proc
WHERE proname = 'place_order';
```

Should return: `place_order`

### Check Sample Data

```sql
-- Should show 3 sample products
SELECT * FROM products;

-- Should show variants with prices
SELECT v.name, v.price, s.quantity_available
FROM variants v
JOIN stock s ON v.id = s.variant_id;
```

---

## 🔧 Step 4: Get Supabase Credentials

1. Go to Supabase dashboard → **Settings → API**
2. Copy:
   - `Project URL` → use as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are already in your `.env.local` if you set them up earlier.

---

## 💻 Step 5: Test Backend via Frontend

### Install dependencies (if not done)
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

### Test via browser
1. Go to http://localhost:3000
2. Navigate to Products page
3. Should see sample products and prices

### Test RPC via browser console
```javascript
// In browser console (F12), test the RPC function:
const { data, error } = await supabase.rpc('place_order', {
  p_customer_name: 'Test User',
  p_whatsapp: '+6281234567890',
  p_pickup_date: '2026-05-15',
  p_items: [
    { variant_id: 'YOUR_VARIANT_UUID', quantity: 1 }
  ],
  p_idempotency_key: crypto.randomUUID()
});

console.log(data, error);
```

---

## 🧪 Step 6: Test Order Function

### Via Supabase SQL Editor

```sql
-- Test place_order RPC
SELECT place_order(
  'Budi Santoso'::text,
  '+6281234567890'::text,
  CURRENT_DATE + 1,
  '[{"variant_id": "UUID_OF_VARIANT", "quantity": 2}]'::jsonb,
  gen_random_uuid()::text
) AS result;
```

Replace `UUID_OF_VARIANT` with actual UUID from your database:
```sql
SELECT id FROM variants LIMIT 1;
```

### Via curl

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/rest/v1/rpc/place_order \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_customer_name": "Budi Santoso",
    "p_whatsapp": "+6281234567890",
    "p_pickup_date": "2026-05-15",
    "p_items": [{"variant_id": "UUID", "quantity": 2}],
    "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order_id": "...",
  "total_amount": 100000,
  "item_count": 1,
  "is_duplicate": false
}
```

---

## 📈 Step 7: Load Testing (Optional)

### Install k6
```bash
# macOS
brew install k6

# Linux
sudo apt-get install k6

# Or via npm
npm install -g k6
```

### Get Variant IDs for Testing

```sql
-- Get variant UUIDs from your database
SELECT id FROM variants LIMIT 5;
```

Copy these UUIDs and update in `tests/load-test.k6.js`:

```javascript
const VARIANT_IDS = [
  'uuid-1',
  'uuid-2',
  'uuid-3',
]
```

### Run Load Test

```bash
# Set environment variables
export SUPABASE_URL=https://YOUR_PROJECT.supabase.co
export SUPABASE_ANON_KEY=your_anon_key

# Run with 20 concurrent users for 60 seconds
k6 run tests/load-test.k6.js

# Or with custom parameters
k6 run -u 50 -d 60s tests/load-test.k6.js
```

### Read Results

```
checks ............................ 98.5% ✓ / ✗
http_req_duration .................. avg=245ms p(95)=512ms p(99)=701ms
```

Expected:
- ✅ Checks > 95%
- ✅ p(95) < 1000ms
- ✅ No stock overselling
- ✅ Idempotency works

---

## 📋 Step 8: Integration Checklist

- [ ] Database schema running
- [ ] RPC function created
- [ ] Sample data inserted
- [ ] Supabase credentials in `.env.local`
- [ ] Dev server running and shows products
- [ ] RPC function callable from browser
- [ ] Load test passing (if you ran it)

---

## 🔐 Step 9: Security Setup

### Enable Row-Level Security (RLS)

```sql
-- Enable RLS on tables (optional but recommended)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read public products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (status = 'active');

-- More policies can be added based on your needs
```

### Restrict RPC Function

Currently RPC is accessible to `authenticated` and `anon` users. You can restrict this:

```sql
-- Option 1: Authenticated users only
ALTER FUNCTION place_order SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION place_order FROM anon;
GRANT EXECUTE ON FUNCTION place_order TO authenticated;

-- Option 2: Keep as is (public, no auth required)
-- Good for public ordering, just ensure rate limiting on API
```

---

## 🚨 Step 10: Monitoring & Maintenance

### Monitor Order Processing

```sql
-- View recent orders
SELECT 
  id, 
  customer_name, 
  total_amount, 
  status, 
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- View failed orders
SELECT error FROM place_order_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
AND success = false;
```

### Monitor Stock

```sql
-- Low stock alerts
SELECT 
  v.name,
  s.quantity_available
FROM stock s
JOIN variants v ON s.variant_id = v.id
WHERE s.quantity_available < 10
ORDER BY s.quantity_available ASC;
```

### Clean Up Old Orders (Optional)

```sql
-- Archive completed orders older than 6 months
UPDATE orders
SET status = 'archived'
WHERE status = 'completed'
AND completed_at < NOW() - INTERVAL '6 months';
```

---

## 🐛 Troubleshooting

### Error: "function place_order does not exist"

**Solution**: Run migration `002_place_order_rpc.sql` again

### Error: "Insufficient stock"

**Solution**: Stock is depleted, need to:
```sql
UPDATE stock SET quantity_available = 100 WHERE variant_id = 'uuid';
```

### Error: "Relation 'products' does not exist"

**Solution**: Run migration `001_bakery_schema.sql` again

### Load test shows race conditions

**Solution**: Verify `FOR UPDATE` locking is in place:
```sql
-- Check RPC function source
SELECT prosrc FROM pg_proc WHERE proname = 'place_order';
-- Should contain "FOR UPDATE"
```

### k6: "No variant IDs set"

**Solution**: Update `VARIANT_IDS` array in `tests/load-test.k6.js`:
```javascript
const VARIANT_IDS = [
  '550e8400-e29b-41d4-a716-446655440001', // your actual UUIDs
  '550e8400-e29b-41d4-a716-446655440002',
]
```

---

## 📚 Next Steps

1. **Build Frontend**: Create React components for:
   - Product listing
   - Shopping cart
   - Checkout form with idempotency key generation

2. **Add Admin Panel**:
   - Stock management
   - Order status updates
   - Revenue reports
   - Customer management

3. **Setup Webhooks**:
   - Send WhatsApp notifications
   - Send invoice emails
   - Trigger fulfillment system

4. **Deploy**:
   - Push to GitHub
   - Deploy frontend to Vercel
   - Supabase handles backend

---

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Questions? Check `docs/BACKEND_ARCHITECTURE.md`
