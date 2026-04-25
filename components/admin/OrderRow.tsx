'use client'

import { updateOrderStatus } from '@/app/admin/orders/actions'
import { useTransition } from 'react'

interface Order {
  id: string
  customer_name: string
  whatsapp: string
  pickup_date: string
  total_amount: number
  status: string
  notes: string | null
}

const statusStyle: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

const statusLabel: Record<string, string> = {
  pending:   'Menunggu',
  confirmed: 'Dikonfirmasi',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export default function OrderRow({ order, isToday }: { order: Order; isToday: boolean }) {
  const [pending, startTransition] = useTransition()

  const act = (status: string) =>
    startTransition(() => updateOrderStatus(order.id, status))

  const waLink = `https://wa.me/${order.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Halo ${order.customer_name}, pesanan Anda di Tatara Bakery sudah siap diambil pada ${new Date(order.pickup_date).toLocaleDateString('id-ID')}. Total: Rp ${Number(order.total_amount).toLocaleString('id-ID')}. Terima kasih! 🥐`
  )}`

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border ${isToday ? 'border-amber-300' : 'border-transparent'}`}>
      {isToday && (
        <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
          Hari ini
        </span>
      )}

      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-900">{order.customer_name}</p>
          <p className="text-gray-500 text-sm">{order.whatsapp}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[order.status]}`}>
          {statusLabel[order.status]}
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>📅 {new Date(order.pickup_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span className="font-semibold text-gray-900">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
      </div>

      {order.notes && (
        <p className="text-xs text-gray-400 mb-3 bg-gray-50 px-2 py-1 rounded-lg">📝 {order.notes}</p>
      )}

      <div className="flex gap-2 flex-wrap mt-3">
        {order.status === 'pending' && (
          <button
            onClick={() => act('confirmed')}
            disabled={pending}
            className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            ✓ Konfirmasi
          </button>
        )}
        {order.status === 'confirmed' && (
          <button
            onClick={() => act('completed')}
            disabled={pending}
            className="flex-1 bg-green-600 text-white text-sm py-2 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
          >
            ✓ Selesai
          </button>
        )}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <button
            onClick={() => act('cancelled')}
            disabled={pending}
            className="flex-1 bg-red-50 text-red-600 text-sm py-2 rounded-xl font-medium hover:bg-red-100 disabled:opacity-50"
          >
            ✗ Batalkan
          </button>
        )}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-500 text-white text-sm py-2 rounded-xl font-medium hover:bg-green-600 text-center"
        >
          💬 WhatsApp
        </a>
      </div>
    </div>
  )
}
