'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adjustStock(variantId: string, delta: number) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('stock')
    .select('quantity_available')
    .eq('variant_id', variantId)
    .single()

  const current = data?.quantity_available ?? 0
  const next = Math.max(0, current + delta)

  await supabase
    .from('stock')
    .update({ quantity_available: next, last_updated: new Date().toISOString() })
    .eq('variant_id', variantId)

  revalidatePath('/admin/stock')
  revalidatePath('/admin/dashboard')
}

export async function setStock(variantId: string, quantity: number) {
  const supabase = await createClient()

  await supabase
    .from('stock')
    .update({ quantity_available: Math.max(0, quantity), last_updated: new Date().toISOString() })
    .eq('variant_id', variantId)

  revalidatePath('/admin/stock')
  revalidatePath('/admin/dashboard')
}
