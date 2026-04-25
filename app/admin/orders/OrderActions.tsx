'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const nextStatus: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'completed',
}

const actionLabel: Record<string, string> = {
  pending: 'Konfirmasi',
  confirmed: 'Selesaikan',
}

export default function OrderActions({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (newStatus: string) => {
    setLoading(true)
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: newStatus }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      {nextStatus[currentStatus] && (
        <button
          onClick={() => handleUpdate(nextStatus[currentStatus])}
          disabled={loading}
          className="px-3 py-1 bg-amber-700 text-white text-xs rounded hover:bg-amber-800 disabled:opacity-50"
        >
          {loading ? '...' : actionLabel[currentStatus]}
        </button>
      )}
      {currentStatus !== 'cancelled' && currentStatus !== 'completed' && (
        <button
          onClick={() => handleUpdate('cancelled')}
          disabled={loading}
          className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 disabled:opacity-50"
        >
          Batalkan
        </button>
      )}
    </div>
  )
}
