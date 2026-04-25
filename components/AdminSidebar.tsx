'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/orders', label: 'Pesanan', icon: '🧾' },
  { href: '/admin/products', label: 'Produk', icon: '🍞' },
  { href: '/admin/stock', label: 'Stok', icon: '📦' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <aside className="w-56 min-h-screen bg-amber-900 text-white flex flex-col">
      <div className="p-5 border-b border-amber-800">
        <div className="text-2xl mb-1">🥐</div>
        <p className="font-bold text-lg leading-tight">Tatara Bakery</p>
        <p className="text-amber-300 text-xs">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              pathname === item.href
                ? 'bg-amber-700 text-white'
                : 'text-amber-200 hover:bg-amber-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-amber-300 hover:bg-amber-800 transition"
        >
          <span>🚪</span>
          Keluar
        </button>
      </div>
    </aside>
  )
}
