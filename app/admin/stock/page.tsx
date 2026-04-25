import StockRow from '@/components/admin/StockRow'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getStock() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stock')
    .select(`
      quantity_available,
      variant:variant_id (
        id,
        name,
        price,
        status,
        product:product_id ( name )
      )
    `)
    .order('quantity_available', { ascending: true })
  return data ?? []
}

export default async function StockPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const stocks = await getStock()

  const empty = stocks.filter((s) => s.quantity_available === 0)
  const low   = stocks.filter((s) => s.quantity_available > 0 && s.quantity_available < 10)
  const ok    = stocks.filter((s) => s.quantity_available >= 10)

  const items = stocks.map((s) => {
    const v = s.variant as unknown as { id: string; name: string; price: number; status: string; product: { name: string } }
    return {
      variantId:   v.id,
      productName: v.product?.name ?? '-',
      variantName: v.name,
      price:       Number(v.price),
      quantity:    s.quantity_available,
    }
  })

  return (
    <div className="p-5 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stok</h1>
        <div className="flex gap-3 mt-2 text-xs font-medium">
          <span className="text-red-600">🔴 {empty.length} habis</span>
          <span className="text-yellow-600">🟡 {low.length} hampir habis</span>
          <span className="text-green-600">🟢 {ok.length} aman</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium">Belum ada data stok</p>
          <p className="text-sm mt-1">Tambah produk & varian terlebih dahulu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <StockRow key={item.variantId} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
