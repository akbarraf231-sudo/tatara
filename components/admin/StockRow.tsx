'use client'

import { adjustStock, setStock } from '@/app/admin/stock/actions'
import { useTransition, useState } from 'react'

interface StockItem {
  variantId: string
  productName: string
  variantName: string
  price: number
  quantity: number
}

export default function StockRow({ item }: { item: StockItem }) {
  const [isPending, startTransition] = useTransition()
  const [inputVal, setInputVal] = useState('')
  const [editing, setEditing] = useState(false)

  const qty = item.quantity
  const isEmpty = qty === 0
  const isLow = qty > 0 && qty < 10

  const statusDot = isEmpty
    ? 'bg-red-500'
    : isLow
    ? 'bg-yellow-400'
    : 'bg-green-500'

  const statusText = isEmpty ? 'Habis' : isLow ? 'Hampir Habis' : 'Aman'
  const statusColor = isEmpty
    ? 'text-red-700 bg-red-50'
    : isLow
    ? 'text-yellow-700 bg-yellow-50'
    : 'text-green-700 bg-green-50'

  const handleSet = () => {
    const val = parseInt(inputVal)
    if (isNaN(val) || val < 0) return
    startTransition(() => setStock(item.variantId, val))
    setInputVal('')
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-gray-900">{item.productName}</p>
          <p className="text-gray-400 text-sm">{item.variantName} · Rp {item.price.toLocaleString('id-ID')}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${statusDot}`} />
          {statusText}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick -/+ */}
        <button
          onClick={() => startTransition(() => adjustStock(item.variantId, -1))}
          disabled={isPending || qty <= 0}
          className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-bold text-lg hover:bg-red-100 disabled:opacity-30 transition"
        >
          −
        </button>

        <span className="text-2xl font-bold text-gray-900 min-w-12 text-center">
          {isPending ? '…' : qty}
        </span>

        <button
          onClick={() => startTransition(() => adjustStock(item.variantId, 1))}
          disabled={isPending}
          className="w-10 h-10 rounded-xl bg-green-50 text-green-600 font-bold text-lg hover:bg-green-100 disabled:opacity-50 transition"
        >
          +
        </button>

        <span className="text-gray-400 text-sm">pcs</span>

        {/* Set exact value */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="ml-auto text-xs text-gray-400 hover:text-amber-700 underline"
          >
            Set manual
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSet}
              disabled={isPending}
              className="bg-amber-700 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-amber-800 disabled:opacity-50"
            >
              Simpan
            </button>
            <button
              onClick={() => { setEditing(false); setInputVal('') }}
              className="text-gray-400 text-xs hover:text-gray-600 px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
