'use client'

import { createProduct, createVariant } from '@/app/admin/products/actions'
import { useTransition, useState } from 'react'

export function AddProductForm() {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [msg, setMsg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await createProduct(name, desc)
      if (res?.error) {
        setMsg(res.error)
      } else {
        setName('')
        setDesc('')
        setMsg('✓ Produk ditambahkan!')
        setTimeout(() => setMsg(''), 2000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Nama Produk *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Croissant Butter"
          required
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Deskripsi</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Keterangan singkat..."
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      {msg && <p className={`text-sm ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-800 disabled:opacity-50"
      >
        {isPending ? 'Menyimpan...' : '+ Tambah Produk'}
      </button>
    </form>
  )
}

export function AddVariantForm({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [conv, setConv] = useState('1')
  const [msg, setMsg] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await createVariant(productId, name, parseInt(price), parseInt(conv))
      if (res?.error) {
        setMsg(res.error)
      } else {
        setName(''); setPrice(''); setConv('1')
        setMsg('✓ Varian ditambahkan!')
        setTimeout(() => { setMsg(''); setOpen(false) }, 1500)
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-amber-700 hover:underline mt-1"
      >
        + Tambah varian
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-3 bg-amber-50 rounded-xl space-y-2 border border-amber-100">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nama</label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Regular"
            required
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Harga (Rp)</label>
          <input
            type="number" value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="25000" min="0" required
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Konversi</label>
          <input
            type="number" value={conv} onChange={(e) => setConv(e.target.value)}
            placeholder="1" min="1" required
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>
      {msg && <p className={`text-xs ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending}
          className="flex-1 bg-amber-700 text-white py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
        >
          {isPending ? '...' : 'Simpan Varian'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-gray-400 text-xs px-2 hover:text-gray-600"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
