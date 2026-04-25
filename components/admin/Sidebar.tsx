'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const nav = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/orders',    icon: '🧾', label: 'Pesanan' },
  { href: '/admin/stock',     icon: '📦', label: 'Stok' },
  { href: '/admin/finance',   icon: '💰', label: 'Keuangan' },
  { href: '/admin/products',  icon: '🍞', label: 'Produk' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-52 min-h-screen bg-amber-900 text-white shrink-0">
        <div className="p-5 border-b border-amber-800">
          <p className="text-xl font-bold">🥐 Tatara</p>
          <p className="text-amber-300 text-xs mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                pathname === href
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-200 hover:bg-amber-800'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-amber-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-amber-300 hover:bg-amber-800 transition"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-amber-900 border-t border-amber-800 z-50">
        <div className="flex justify-around">
          {nav.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-3 text-xs transition ${
                pathname === href ? 'text-white' : 'text-amber-300'
              }`}
            >
              <span className="text-xl mb-0.5">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
