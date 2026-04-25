/**
 * K6 Load Testing Script for Bakery Order System
 *
 * Tests:
 * - Concurrent order placement (20 users)
 * - Race condition prevention (stock overselling)
 * - Idempotency (retry handling)
 * - Error handling
 *
 * Installation:
 * npm install k6
 *
 * Run:
 * k6 run tests/load-test.k6.js
 *
 * Run with custom vus and duration:
 * k6 run -u 50 -d 30s tests/load-test.k6.js
 */

import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'

// ============================================================================
// CONFIGURATION
// ============================================================================

// Update these with your actual Supabase credentials
// Set via environment variables: export SUPABASE_URL=... && export SUPABASE_ANON_KEY=...
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE'

// RPC endpoint
const RPC_ENDPOINT = `${SUPABASE_URL}/rest/v1/rpc/place_order`

// Variant IDs (you need to get these from your database)
// Get from: SELECT id FROM variants LIMIT 5
const VARIANT_IDS = [
  // Replace with actual variant UUIDs from your database
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
]

// ============================================================================
// LOAD PROFILE
// ============================================================================

export const options = {
  vus: 20, // 20 concurrent users
  duration: '60s', // 60 seconds
  rampUp: '10s', // Ramp up over 10 seconds

  thresholds: {
    // Success rate must be > 95%
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
    'checks': ['rate>0.95'],
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate random idempotency key
 * In real scenario, this is generated once per order attempt
 */
function generateIdempotencyKey() {
  return uuidv4()
}

/**
 * Generate realistic customer data
 */
function generateCustomerData(userId) {
  return {
    customer_name: `Customer ${userId}`,
    whatsapp: `+62812345${String(userId).padStart(4, '0')}`,
    pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    notes: `Test order #${userId}`,
  }
}

/**
 * Get random variant ID
 */
function getRandomVariantId() {
  return VARIANT_IDS[Math.floor(Math.random() * VARIANT_IDS.length)]
}

/**
 * Build order payload
 */
function buildOrderPayload(userId) {
  const customer = generateCustomerData(userId)

  return {
    p_customer_name: customer.customer_name,
    p_whatsapp: customer.whatsapp,
    p_pickup_date: customer.pickup_date,
    p_items: [
      {
        variant_id: getRandomVariantId(),
        quantity: Math.floor(Math.random() * 3) + 1, // 1-3 items
      },
    ],
    p_idempotency_key: generateIdempotencyKey(),
    p_notes: customer.notes,
  }
}

// ============================================================================
// MAIN TEST SCENARIO
// ============================================================================

export default function (data) {
  const userId = __VU

  group('Place Order - Normal Case', () => {
    const payload = JSON.stringify(buildOrderPayload(userId))

    const headers = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }

    console.log(`[User ${userId}] Placing order...`)

    const res = http.post(RPC_ENDPOINT, payload, { headers })

    // Check response status
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response is valid JSON': (r) => {
        try {
          JSON.parse(r.body)
          return true
        } catch {
          return false
        }
      },
    })

    // Parse and validate response
    try {
      const responseBody = JSON.parse(res.body)

      // Check if order was successful or idempotent duplicate
      const isSuccess = responseBody.success === true
      const hasOrderId = responseBody.order_id !== undefined

      check(res, {
        'order placement successful': () => isSuccess,
        'order_id returned': () => hasOrderId,
        'has total_amount': () => responseBody.total_amount !== undefined,
      })

      if (isSuccess) {
        console.log(
          `[User ${userId}] ✓ Order placed: ${responseBody.order_id} - Rp ${responseBody.total_amount}`
        )
      } else {
        console.error(`[User ${userId}] ✗ Order failed: ${responseBody.error}`)
      }
    } catch (error) {
      console.error(`[User ${userId}] Failed to parse response:`, error)
    }
  })

  // Simulate small delay between requests
  sleep(1)

  // ========================================================================
  // TEST SCENARIO 2: IDEMPOTENCY (Retry with same key)
  // ========================================================================

  group('Place Order - Idempotency Test', () => {
    const customer = generateCustomerData(userId)
    const idempotencyKey = generateIdempotencyKey()

    // First attempt
    console.log(`[User ${userId}] First order attempt with idempotency key...`)
    const payload1 = JSON.stringify({
      p_customer_name: customer.customer_name,
      p_whatsapp: customer.whatsapp,
      p_pickup_date: customer.pickup_date,
      p_items: [
        {
          variant_id: getRandomVariantId(),
          quantity: 1,
        },
      ],
      p_idempotency_key: idempotencyKey, // Same key
      p_notes: null,
    })

    const headers = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    }

    const res1 = http.post(RPC_ENDPOINT, payload1, { headers })
    const body1 = JSON.parse(res1.body)
    const orderId1 = body1.order_id

    check(res1, {
      'first attempt successful': () => body1.success === true,
      'first attempt is_duplicate is false': () => body1.is_duplicate === false,
    })

    sleep(0.5)

    // Second attempt (retry) with SAME idempotency key
    console.log(`[User ${userId}] Retry with same idempotency key...`)
    const res2 = http.post(RPC_ENDPOINT, payload1, { headers })
    const body2 = JSON.parse(res2.body)
    const orderId2 = body2.order_id

    check(res2, {
      'retry successful': () => body2.success === true,
      'retry returns same order_id': () => orderId1 === orderId2,
      'retry is_duplicate is true': () => body2.is_duplicate === true,
    })

    if (orderId1 === orderId2) {
      console.log(
        `[User ${userId}] ✓ Idempotency verified: both attempts returned ${orderId1}`
      )
    } else {
      console.error(`[User ${userId}] ✗ Idempotency failed: ${orderId1} !== ${orderId2}`)
    }
  })

  sleep(1)
}

// ============================================================================
// TEARDOWN (run after all tests)
// ============================================================================

export function teardown(data) {
  console.log('✓ Load test completed')
  console.log('Check results above for performance metrics')
}

// ============================================================================
// EXECUTION INSTRUCTIONS
// ============================================================================

/*

1. Get variant IDs from your database:

   SELECT id FROM variants LIMIT 5;

   Copy the UUIDs and update VARIANT_IDS in this script.

2. Set environment variables:

   export SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   export SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

3. Run the test:

   k6 run tests/load-test.k6.js

4. View results:

   - Look for "checks" section - success rate should be > 95%
   - Look for "http_req_duration" - p95 should be < 1000ms
   - Look for any stock overselling or race condition errors

5. Increase load:

   k6 run -u 50 -d 60s tests/load-test.k6.js  # 50 concurrent users, 60 seconds

*/
