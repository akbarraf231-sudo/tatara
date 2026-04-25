import { redirect } from 'next/navigation'
import { createClient } from './server'

/**
 * Server-side guard untuk halaman admin.
 * - Belum login → /admin/login
 * - Login tapi bukan admin → /
 * Return user object kalau lolos.
 */
export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return { user, supabase }
}
