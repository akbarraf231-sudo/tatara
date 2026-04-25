import OrderRow from '@/components/admin/OrderRow'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getOrders() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('id, customer_name, whatsapp, pickup_date, total_amount, status, notes')
    .gte('pickup_date', new Date().toISOString().split('T')[0])
    .order('pickup_date', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const orders = await getOrders()
  const today = new Date().toISOString().split('T')[0]

  const pending   = orders.filter((o) => o.status === 'pending')
  const confirmed = orders.filter((o) => o.status === 'confirmed')
  const rest      = orders.filter((o) => !['pending', 'confirmed'].includes(o.status))

  const sorted = [...pending, ...confirmed, ...rest]

  return (
    <div className="p-5 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
        <p className="text-gray-400 text-sm mt-0.5">Hari ini & mendatang · {orders.length} pesanan</p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              isToday={order.pickup_date === today}
            />
          ))}
        </div>
      )}
    </div>
  )
}
