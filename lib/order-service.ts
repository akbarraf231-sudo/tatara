/**
 * Order Service - Frontend integration with Supabase RPC
 * Handles idempotency, retries, and error handling
 */

import { supabase } from './supabase'

interface OrderItem {
  variant_id: string
  quantity: number
}

interface PlaceOrderRequest {
  customer_name: string
  whatsapp: string
  pickup_date: string // YYYY-MM-DD format
  items: OrderItem[]
  notes?: string
}

interface PlaceOrderResponse {
  success: boolean
  message: string
  order_id?: string
  total_amount?: number
  item_count?: number
  is_duplicate?: boolean
  error?: string
  error_code?: string
}

/**
 * Generate idempotency key - unique identifier for order attempt
 * This ensures retries don't create duplicate orders
 *
 * Usage:
 * - Generate once per order attempt (before sending to backend)
 * - If network fails and user retries, reuse SAME key
 * - Backend will recognize it's the same order and return existing order_id
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}

/**
 * Place order with automatic retry on network failures
 * Implements exponential backoff for retries
 *
 * @param request - Order details
 * @param idempotencyKey - Unique identifier (generated once per order attempt)
 * @param maxRetries - Number of retries on network failure (default: 3)
 * @returns Supabase RPC response
 *
 * IMPORTANT: Same idempotencyKey must be used for all retries of the same order attempt!
 */
export async function placeOrderWithRetry(
  request: PlaceOrderRequest,
  idempotencyKey: string,
  maxRetries: number = 3
): Promise<PlaceOrderResponse> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await supabase.rpc('place_order', {
        p_customer_name: request.customer_name,
        p_whatsapp: request.whatsapp,
        p_pickup_date: request.pickup_date,
        p_items: request.items,
        p_idempotency_key: idempotencyKey,
        p_notes: request.notes || null,
      })

      // Check for RPC errors
      if (response.error) {
        console.error('RPC Error:', response.error)
        return {
          success: false,
          message: response.error.message,
          error: response.error.message,
          error_code: response.error.code,
        }
      }

      // Return successful response
      return response.data as PlaceOrderResponse
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, error)

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // Return error after all retries exhausted
  return {
    success: false,
    message: 'Order failed after retries',
    error: lastError?.message || 'Unknown error',
  }
}

/**
 * Simple place order without retry logic
 * Use this if you want to handle retries yourself
 */
export async function placeOrder(
  request: PlaceOrderRequest,
  idempotencyKey: string
): Promise<PlaceOrderResponse> {
  try {
    const response = await supabase.rpc('place_order', {
      p_customer_name: request.customer_name,
      p_whatsapp: request.whatsapp,
      p_pickup_date: request.pickup_date,
      p_items: request.items,
      p_idempotency_key: idempotencyKey,
      p_notes: request.notes || null,
    })

    if (response.error) {
      return {
        success: false,
        message: response.error.message,
        error: response.error.message,
        error_code: response.error.code,
      }
    }

    return response.data as PlaceOrderResponse
  } catch (error) {
    return {
      success: false,
      message: 'Network error',
      error: (error as Error).message,
    }
  }
}

