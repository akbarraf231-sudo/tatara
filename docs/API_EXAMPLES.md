# Bakery API - Request/Response Examples

Complete examples for integrating with the bakery ordering backend.

---

## 🔗 RPC Endpoint

```
POST /rest/v1/rpc/place_order
Host: YOUR_PROJECT.supabase.co
```

---

## ✅ Example 1: Successful Order

### Request

```json
{
  "p_customer_name": "Budi Santoso",
  "p_whatsapp": "+6281234567890",
  "p_pickup_date": "2026-05-15",
  "p_items": [
    {
      "variant_id": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    },
    {
      "variant_id": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 1
    }
  ],
  "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440099",
  "p_notes": "Slice the cake into 8 pieces"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Order placed successfully",
  "order_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "total_amount": 100000,
  "item_count": 2,
  "is_duplicate": false
}
```

---

## 🔄 Example 2: Idempotent Retry (Same Order)

### Request (Same payload + same idempotency_key)

```json
{
  "p_customer_name": "Budi Santoso",
  "p_whatsapp": "+6281234567890",
  "p_pickup_date": "2026-05-15",
  "p_items": [
    {
      "variant_id": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    },
    {
      "variant_id": "550e8400-e29b-41d4-a716-446655440002",
      "quantity": 1
    }
  ],
  "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440099",
  "p_notes": "Slice the cake into 8 pieces"
}
```

### Response (200 OK)

⭐ **Same order_id returned, no duplicate created!**

```json
{
  "success": true,
  "message": "Order already exists (idempotent response)",
  "order_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "is_duplicate": true
}
```

---

## ❌ Example 3: Insufficient Stock Error

### Request

```json
{
  "p_customer_name": "Ani Wijaya",
  "p_whatsapp": "+6282345678901",
  "p_pickup_date": "2026-05-16",
  "p_items": [
    {
      "variant_id": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 1000
    }
  ],
  "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440088",
  "p_notes": null
}
```

### Response (400/500 - Depends on Supabase)

```json
{
  "success": false,
  "error": "Insufficient stock for variant 550e8400-e29b-41d4-a716-446655440001. Available: 50, Required: 1000",
  "error_code": "P0001"
}
```

**What happened**: 
- ❌ Stock NOT deducted
- ❌ Order NOT created
- ✅ Customer can retry with correct quantity

---

## ❌ Example 4: Invalid Variant

### Request

```json
{
  "p_customer_name": "Citra Dewi",
  "p_whatsapp": "+6283456789012",
  "p_pickup_date": "2026-05-17",
  "p_items": [
    {
      "variant_id": "00000000-0000-0000-0000-000000000000",
      "quantity": 2
    }
  ],
  "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440077",
  "p_notes": null
}
```

### Response

```json
{
  "success": false,
  "error": "Variant 00000000-0000-0000-0000-000000000000 not found or inactive",
  "error_code": "P0001"
}
```

---

## ❌ Example 5: Invalid Pickup Date

### Request

```json
{
  "p_customer_name": "Dedi Supriadi",
  "p_whatsapp": "+6284567890123",
  "p_pickup_date": "2020-01-01",
  "p_items": [
    {
      "variant_id": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    }
  ],
  "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440066",
  "p_notes": null
}
```

### Response

```json
{
  "success": false,
  "error": "Pickup date cannot be in the past",
  "error_code": "P0001"
}
```

---

## ❌ Example 6: Empty Items

### Request

```json
{
  "p_customer_name": "Eka Putra",
  "p_whatsapp": "+6285678901234",
  "p_pickup_date": "2026-05-18",
  "p_items": [],
  "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440055",
  "p_notes": null
}
```

### Response

```json
{
  "success": false,
  "error": "No items in order",
  "error_code": "P0001"
}
```

---

## 🔧 cURL Examples

### Success Order
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/rest/v1/rpc/place_order \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_customer_name": "Budi Santoso",
    "p_whatsapp": "+6281234567890",
    "p_pickup_date": "2026-05-15",
    "p_items": [
      {"variant_id": "550e8400-e29b-41d4-a716-446655440001", "quantity": 2}
    ],
    "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440099"
  }' | jq
```

### With Authorization Header (Authenticated Users)
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/rest/v1/rpc/place_order \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq
```

---

## 📱 JavaScript/Fetch Example

```javascript
// Generate idempotency key (unique per order attempt)
const idempotencyKey = crypto.randomUUID();

const payload = {
  p_customer_name: "Budi Santoso",
  p_whatsapp: "+6281234567890",
  p_pickup_date: "2026-05-15",
  p_items: [
    {
      variant_id: "550e8400-e29b-41d4-a716-446655440001",
      quantity: 2
    }
  ],
  p_idempotency_key: idempotencyKey,
  p_notes: "Slice the cake"
};

const response = await fetch(
  'https://YOUR_PROJECT.supabase.co/rest/v1/rpc/place_order',
  {
    method: 'POST',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }
);

const data = await response.json();
console.log(data);

// Response:
// {
//   success: true,
//   message: "Order placed successfully",
//   order_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
//   total_amount: 100000,
//   is_duplicate: false
// }
```

---

## 📌 Supabase JS Client Example

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function placeOrder() {
  const idempotencyKey = crypto.randomUUID();

  const { data, error } = await supabase.rpc('place_order', {
    p_customer_name: 'Budi Santoso',
    p_whatsapp: '+6281234567890',
    p_pickup_date: '2026-05-15',
    p_items: [
      { variant_id: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 }
    ],
    p_idempotency_key: idempotencyKey,
    p_notes: 'Slice the cake'
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Order placed:', data);
    // {
    //   success: true,
    //   order_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    //   total_amount: 100000
    // }
  }
}

await placeOrder();
```

---

## 📊 Query Orders

### Get Single Order

```sql
SELECT * FROM orders WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
```

### Get Order with Items

```sql
SELECT
  o.id,
  o.customer_name,
  o.total_amount,
  o.status,
  json_agg(
    json_build_object(
      'variant_id', oi.variant_id,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'subtotal', oi.subtotal
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
GROUP BY o.id, o.customer_name, o.total_amount, o.status;
```

### Get All Pending Orders

```sql
SELECT * FROM orders
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Get Orders by Date

```sql
SELECT * FROM orders
WHERE DATE(created_at) = '2026-05-15'
ORDER BY created_at DESC;
```

---

## 🔐 Security Headers

Always include these headers in production:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'apikey': process.env.SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${userToken}`, // if using auth
  'X-Idempotency-Key': idempotencyKey,
  'User-Agent': 'Tatara-Bakery-App/1.0'
}
```

---

## ⚡ Rate Limiting

Recommended rate limits:
- Per IP: 100 requests/minute
- Per user: 20 orders/hour
- Per variant: Prevent abuse by validating inventory

Configure in your API gateway or Supabase custom policies.

---

## 🧪 Testing with Postman

1. Create new POST request
2. URL: `https://YOUR_PROJECT.supabase.co/rest/v1/rpc/place_order`
3. Headers:
   ```
   apikey: YOUR_ANON_KEY
   Content-Type: application/json
   ```
4. Body (raw JSON):
   ```json
   {
     "p_customer_name": "Test User",
     "p_whatsapp": "+62123456789",
     "p_pickup_date": "2026-05-15",
     "p_items": [{"variant_id": "UUID", "quantity": 1}],
     "p_idempotency_key": "550e8400-e29b-41d4-a716-446655440099"
   }
   ```
5. Click Send
6. Check response

---

## 📞 Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| P0001 | Application Error | Check error message |
| 23502 | NOT NULL Violation | Missing required field |
| 23505 | Unique Violation | Idempotency key duplicate (normal) |
| 42703 | Undefined Column | Schema mismatch |

---

## 💡 Pro Tips

1. **Always generate idempotency key before sending request**
2. **Retry with same key if network fails**
3. **Validate response.success before using order_id**
4. **Store order_id immediately after success**
5. **Don't rely on timestamp for ordering - use order_id**
6. **Monitor error rates for stock issues**
7. **Implement exponential backoff for retries**
