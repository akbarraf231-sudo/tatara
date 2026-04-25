'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StockAdjust({
  variantId,
  currentStock,
}: {
  variantId: string
  currentStock: number
}) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdjust = async (type: 'add' | 'set') => {
    const value = parseInt(amount)
    if (isNaN(value) || value < 0) return

    setLoading(true)
    await fetch('/api/admin/stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, amount: value, type }),
    })
    setAmount('')
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Jumlah"
        className="w-20 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      <button
        onClick={() => handleAdjust('add')}
        disabled={loading || !amount}
        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 disabled:opacity-40"
      >
        + Tambah
      </button>
      <button
        onClick={() => handleAdjust('set')}
        disabled={loading || !amount}
        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 disabled:opacity-40"
      >
        = Set
      </button>
    </div>
  )
}
