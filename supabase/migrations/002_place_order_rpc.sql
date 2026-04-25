-- ============================================================================
-- RPC FUNCTION: place_order
-- ============================================================================
-- Production-ready order placement with:
-- - Idempotency (prevent duplicate orders)
-- - Race condition safety (pessimistic locking)
-- - Stock validation
-- - Atomic transaction
-- ============================================================================

CREATE OR REPLACE FUNCTION place_order(
  p_customer_name TEXT,
  p_whatsapp TEXT,
  p_pickup_date DATE,
  p_items JSONB,
  -- p_items format: [{"variant_id": "uuid", "quantity": 2}, ...]
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
  v_item_count INT := 0;
  v_existing_order_id UUID;
BEGIN
  -- ========================================================================
  -- STEP 1: IDEMPOTENCY CHECK
  -- ========================================================================
  -- If same idempotency_key exists, return existing order
  -- This ensures retries don't create duplicate orders
  SELECT id INTO v_existing_order_id
  FROM orders
  WHERE idempotency_key = p_idempotency_key
  LIMIT 1;

  IF v_existing_order_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Order already exists (idempotent response)',
      'order_id', v_existing_order_id,
      'is_duplicate', true
    );
  END IF;

  -- ========================================================================
  -- STEP 2: VALIDATE INPUT
  -- ========================================================================
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items in order';
  END IF;

  IF p_pickup_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Pickup date cannot be in the past';
  END IF;

  -- ========================================================================
  -- STEP 3: CREATE ORDER (PENDING)
  -- ========================================================================
  INSERT INTO orders (
    idempotency_key,
    customer_name,
    whatsapp,
    pickup_date,
    status,
    notes,
    total_amount
  ) VALUES (
    p_idempotency_key,
    p_customer_name,
    p_whatsapp,
    p_pickup_date,
    'pending',
    p_notes,
    0 -- Placeholder, will update after calculating items
  ) RETURNING id INTO v_order_id;

  -- ========================================================================
  -- STEP 4: PROCESS ORDER ITEMS
  -- ========================================================================
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    -- Validate quantity
    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for variant %', v_variant_id;
    END IF;

    -- Get variant details and lock the stock row
    -- FOR UPDATE ensures row-level locking prevents race conditions
    SELECT price, stock_conversion
    INTO v_variant_price, v_stock_conversion
    FROM variants
    WHERE id = v_variant_id AND status = 'active'
    LIMIT 1;

    IF v_variant_price IS NULL THEN
      RAISE EXCEPTION 'Variant % not found or inactive', v_variant_id;
    END IF;

    -- Calculate required stock (considering stock_conversion)
    v_required_stock := v_quantity * v_stock_conversion;

    -- Lock stock row and check availability
    -- This prevents race condition: "select then update"
    -- Instead: "lock then select then update"
    SELECT quantity_available
    INTO v_available_stock
    FROM stock
    WHERE variant_id = v_variant_id
    FOR UPDATE; -- Pessimistic lock

    IF v_available_stock IS NULL THEN
      RAISE EXCEPTION 'Stock not initialized for variant %', v_variant_id;
    END IF;

    IF v_available_stock < v_required_stock THEN
      RAISE EXCEPTION 'Insufficient stock for variant %. Available: %, Required: %',
        v_variant_id, v_available_stock, v_required_stock;
    END IF;

    -- Deduct stock
    UPDATE stock
    SET quantity_available = quantity_available - v_required_stock,
        last_updated = CURRENT_TIMESTAMP
    WHERE variant_id = v_variant_id;

    -- Calculate subtotal
    v_subtotal := v_quantity * v_variant_price;
    v_total_amount := v_total_amount + v_subtotal;

    -- Insert order item
    INSERT INTO order_items (
      order_id,
      variant_id,
      quantity,
      unit_price,
      subtotal
    ) VALUES (
      v_order_id,
      v_variant_id,
      v_quantity,
      v_variant_price,
      v_subtotal
    );

    v_item_count := v_item_count + 1;
  END LOOP;

  -- ========================================================================
  -- STEP 5: UPDATE ORDER WITH TOTAL AMOUNT
  -- ========================================================================
  UPDATE orders
  SET total_amount = v_total_amount,
      status = 'confirmed',
      confirmed_at = CURRENT_TIMESTAMP
  WHERE id = v_order_id;

  -- ========================================================================
  -- STEP 6: RECORD TRANSACTION (INCOME)
  -- ========================================================================
  INSERT INTO transactions (
    order_id,
    type,
    amount,
    description
  ) VALUES (
    v_order_id,
    'income',
    v_total_amount,
    'Order #' || SUBSTRING(v_order_id::TEXT, 1, 8) || ' from ' || p_customer_name
  );

  -- ========================================================================
  -- STEP 7: RETURN SUCCESS
  -- ========================================================================
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Order placed successfully',
    'order_id', v_order_id,
    'total_amount', v_total_amount,
    'item_count', v_item_count,
    'is_duplicate', false
  );

EXCEPTION WHEN OTHERS THEN
  -- If any error occurs, entire transaction rolls back
  -- Stock is NOT deducted, order is NOT created
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_code', SQLSTATE
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION place_order(TEXT, TEXT, DATE, JSONB, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION place_order(TEXT, TEXT, DATE, JSONB, TEXT, TEXT) TO anon;
