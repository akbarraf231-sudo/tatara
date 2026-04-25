import { AddProductForm, AddVariantForm } from '@/components/admin/ProductForm'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createClient } from '@/lib/supabase/server'
import { toggleProductStatus } from './actions'

async function getProducts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`
      id, name, description, status,
      variants (id, name, price, stock_conversion, status)
    `)
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function ProductsPage() {
  await requireAdmin()
  const products = await getProducts()

  return (
    <div className="p-5 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
        <p className="text-gray-400 text-sm mt-0.5">{products.length} produk terdaftar</p>
      </div>

      {/* Add product form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Tambah Produk Baru</h2>
        <AddProductForm />
      </div>

      {/* Product list */}
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {product.description && (
                  <p className="text-gray-400 text-sm truncate">{product.description}</p>
                )}
              </div>
              <form action={async () => {
                'use server'
                await toggleProductStatus(product.id, product.status)
              }}>
                <button
                  type="submit"
                  className={`ml-3 text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                    product.status === 'active'
                      ? 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {product.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </form>
            </div>

            {/* Variants */}
            {(product.variants?.length ?? 0) > 0 && (
              <div className="border-t border-gray-50 px-4 pb-1">
                <p className="text-xs text-gray-400 font-medium pt-3 pb-2">VARIAN</p>
                <div className="space-y-1.5 mb-2">
                  {product.variants?.map((v) => (
                    <div key={v.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{v.name}</span>
                      <div className="flex items-center gap-3 text-gray-500">
                        <span>Rp {Number(v.price).toLocaleString('id-ID')}</span>
                        {v.stock_conversion > 1 && (
                          <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                            ×{v.stock_conversion}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-4 pb-4">
              <AddVariantForm productId={product.id} />
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍞</p>
            <p className="font-medium">Belum ada produk</p>
            <p className="text-sm mt-1">Tambah produk pertama di atas</p>
          </div>
        )}
      </div>
    </div>
  )
}
