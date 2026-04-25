'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(amount: number, description: string) {
  if (amount <= 0 || !description.trim()) return

  const supabase = await createClient()

  await supabase.from('transactions').insert({
    type: 'expense',
    amount,
    description: description.trim(),
  })

  revalidatePath('/admin/finance')
  revalidatePath('/admin/dashboard')
}
