import AdminSidebar from '@/components/AdminSidebar'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import StockAdjust from './StockAdjust'

async function getStock() {
  const { data } = await supabase
    .from('stock')
    .select(`
      id,
      quantity_available,
      last_updated,
      variant:variant_id (
        id,
        name,
        price,
        product:product_id (name)
      )
    `)
    .order('quantity_available', { ascending: true })

  return data ?? []
}

export default async function StockPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin')

  const stocks = await getStock()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Stok</h1>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Produk / Varian</th>
                  <th className="text-left px-5 py-3">Harga</th>
                  <th className="text-left px-5 py-3">Stok Tersedia</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Update Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stocks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-12">
                      Belum ada data stok
                    </td>
                  </tr>
                ) : (
                  stocks.map((stock) => {
                    const variant = stock.variant as unknown as {
                      id: string; name: string; price: number;
                      product: { name: string }
                    }
                    const qty = stock.quantity_available
                    const isLow = qty < 10
                    const isEmpty = qty === 0

                    return (
                      <tr key={stock.id} className={isEmpty ? 'bg-red-50' : isLow ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{variant?.product?.name}</p>
                          <p className="text-gray-400 text-xs">{variant?.name}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          Rp {Number(variant?.price).toLocaleString('id-ID')}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-lg font-bold ${isEmpty ? 'text-red-600' : isLow ? 'text-yellow-600' : 'text-green-700'}`}>
                            {qty}
                          </span>
                          <span className="text-gray-400 text-xs ml-1">pcs</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            isEmpty ? 'bg-red-100 text-red-700'
                            : isLow ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                          }`}>
                            {isEmpty ? 'Habis' : isLow ? 'Hampir Habis' : 'Tersedia'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <StockAdjust variantId={variant?.id} currentStock={qty} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
