import DashboardCard from '@/components/admin/DashboardCard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getDashboardData() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [incomeRes, expenseRes, ordersRes, lowStockRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'income')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),
    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'expense')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),
    supabase
      .from('orders')
      .select('id, status')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),
    supabase
      .from('stock')
      .select('quantity_available, variant:variant_id(name, product:product_id(name))')
      .lt('quantity_available', 10)
      .order('quantity_available', { ascending: true }),
  ])

  const income = incomeRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const expense = expenseRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const profit = income - expense
  const orders = ordersRes.data ?? []
  const lowStock = lowStockRes.data ?? []

  return { income, expense, profit, orders, lowStock }
}

function fmt(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { income, expense, profit, orders, lowStock } = await getDashboardData()

  const todayLabel = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">{todayLabel}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <DashboardCard label="Pendapatan" value={fmt(income)} icon="💵" color="green" sub="Hari ini" />
        <DashboardCard label="Pengeluaran" value={fmt(expense)} icon="🧾" color="red" sub="Hari ini" />
        <DashboardCard label="Keuntungan" value={fmt(profit)} icon="📈" color={profit >= 0 ? 'blue' : 'red'} sub="Hari ini" />
        <DashboardCard label="Pesanan" value={String(orders.length)} icon="🛒" color="amber" sub="Hari ini" />
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
          <h2 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span>⚠️</span> Stok Hampir Habis ({lowStock.length} varian)
          </h2>
          <div className="space-y-2">
            {lowStock.map((item, i) => {
              const variant = item.variant as unknown as { name: string; product: { name: string } }
              return (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">
                    {variant?.product?.name} — {variant?.name}
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                    item.quantity_available === 0
                      ? 'bg-red-200 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.quantity_available === 0 ? 'Habis' : `${item.quantity_available} pcs`}
                  </span>
                </div>
              )
            })}
          </div>
          <a href="/admin/stock" className="inline-block mt-3 text-sm text-red-600 font-medium hover:underline">
            → Kelola Stok
          </a>
        </div>
      )}

      {/* Today's orders quick view */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Pesanan Hari Ini</h2>
          <a href="/admin/orders" className="text-sm text-amber-700 hover:underline">Lihat semua →</a>
        </div>
        {orders.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">Belum ada pesanan hari ini</p>
        ) : (
          <div className="p-5 flex gap-4 flex-wrap">
            {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => {
              const count = orders.filter((o) => o.status === s).length
              const colors = {
                pending: 'bg-yellow-50 text-yellow-700',
                confirmed: 'bg-blue-50 text-blue-700',
                completed: 'bg-green-50 text-green-700',
                cancelled: 'bg-gray-100 text-gray-500',
              }
              const labels = {
                pending: 'Menunggu',
                confirmed: 'Dikonfirmasi',
                completed: 'Selesai',
                cancelled: 'Dibatalkan',
              }
              return (
                <div key={s} className={`rounded-xl px-4 py-3 text-center min-w-24 ${colors[s]}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs mt-0.5">{labels[s]}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
