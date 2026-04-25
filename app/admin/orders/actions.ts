'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()

  const extra: Record<string, string> = {}
  if (status === 'confirmed') extra.confirmed_at = new Date().toISOString()
  if (status === 'completed') extra.completed_at = new Date().toISOString()
  if (status === 'cancelled') extra.cancelled_at = new Date().toISOString()

  await supabase.from('orders').update({ status, ...extra }).eq('id', orderId)
  revalidatePath('/admin/orders')
  revalidatePath('/admin/dashboard')
}
