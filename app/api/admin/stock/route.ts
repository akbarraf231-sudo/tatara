import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const authed = await isAdminAuthenticated()
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { variantId, amount, type } = await request.json()

  if (typeof amount !== 'number' || amount < 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  let updateQuery

  if (type === 'add') {
    // Add to existing stock
    const { data: current } = await supabase
      .from('stock')
      .select('quantity_available')
      .eq('variant_id', variantId)
      .single()

    const newQty = (current?.quantity_available ?? 0) + amount
    updateQuery = supabase
      .from('stock')
      .update({ quantity_available: newQty, last_updated: new Date().toISOString() })
      .eq('variant_id', variantId)
  } else {
    // Set absolute value
    updateQuery = supabase
      .from('stock')
      .update({ quantity_available: amount, last_updated: new Date().toISOString() })
      .eq('variant_id', variantId)
  }

  const { error } = await updateQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
