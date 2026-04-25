import AdminSidebar from '@/components/AdminSidebar'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import OrderActions from './OrderActions'

async function getOrders() {
  const { data } = await supabase
    .from('orders')
    .select('id, customer_name, whatsapp, pickup_date, total_amount, status, created_at')
    .order('created_at', { ascending: false })

  return data ?? []
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function OrdersPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin')

  const orders = await getOrders()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Pesanan</h1>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">WhatsApp</th>
                  <th className="text-left px-5 py-3">Pickup</th>
                  <th className="text-left px-5 py-3">Total</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-12">
                      Belum ada pesanan
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-gray-400 text-xs font-mono">{order.id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{order.whatsapp}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {new Date(order.pickup_date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900">
                        Rp {Number(order.total_amount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.status] ?? 'bg-gray-100'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <OrderActions orderId={order.id} currentStatus={order.status} />
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
