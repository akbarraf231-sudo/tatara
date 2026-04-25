import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const authed = await isAdminAuthenticated()
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, image_url } = await request.json()

  if (!name?.trim()) return NextResponse.json({ error: 'Nama produk wajib diisi' }, { status: 400 })

  const { data, error } = await supabase
    .from('products')
    .insert({ name: name.trim(), description, image_url, status: 'active' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id })
}
