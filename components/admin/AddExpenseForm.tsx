'use client'

import { addExpense } from '@/app/admin/finance/actions'
import { useTransition, useState } from 'react'

export default function AddExpenseForm() {
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(amount)
    if (isNaN(val) || val <= 0 || !desc.trim()) return

    startTransition(async () => {
      await addExpense(val, desc)
      setAmount('')
      setDesc('')
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h2 className="font-semibold text-gray-800">Tambah Pengeluaran</h2>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Keterangan</label>
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Bahan baku, gas, dll."
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Jumlah (Rp)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50000"
          min="1"
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {done && <p className="text-green-600 text-sm">✓ Pengeluaran ditambahkan</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? 'Menyimpan...' : '+ Tambah Pengeluaran'}
      </button>
    </form>
  )
}
