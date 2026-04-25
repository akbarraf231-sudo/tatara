import AdminSidebar from '@/components/AdminSidebar'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

async function getStats() {
  const [ordersRes, revenueRes, stockRes] = await Promise.all([
    supabase.from('orders').select('id, status, total_amount, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('transactions').select('amount').eq('type', 'income'),
    supabase.from('stock').select('quantity_available').lt('quantity_available', 10),
  ])

  const totalRevenue = revenueRes.data?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0
  const recentOrders = ordersRes.data ?? []
  const lowStockCount = stockRes.data?.length ?? 0

  return { totalRevenue, recentOrders, lowStockCount }
}

export default async function DashboardPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin')

  const { totalRevenue, recentOrders, lowStockCount } = await getStats()

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-amber-500">
            <p className="text-sm text-gray-500">Total Pendapatan</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Pesanan Terbaru</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{recentOrders.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-400">
            <p className="text-sm text-gray-500">Stok Hampir Habis</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{lowStockCount} varian</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Pesanan Terbaru</h2>
            <a href="/admin/orders" className="text-sm text-amber-700 hover:underline">
              Lihat semua →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">ID</th>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">Total</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-8">
                      Belum ada pesanan
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {(order as unknown as Record<string, string>).customer_name}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        Rp {Number(order.total_amount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
