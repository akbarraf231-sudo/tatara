import AdminSidebar from '@/components/AdminSidebar'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ProductForm from './ProductForm'

async function getProducts() {
  const { data } = await supabase
    .from('products')
    .select('id, name, description, status, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function ProductsPage() {
  const authed = await isAdminAuthenticated()
  if (!authed) redirect('/admin')

  const products = await getProducts()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Produk</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Tambah Produk */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Tambah Produk Baru</h2>
            <ProductForm />
          </div>

          {/* Daftar Produk */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Daftar Produk ({products.length})</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <li className="text-center text-gray-400 py-8">Belum ada produk</li>
              ) : (
                products.map((product) => (
                  <li key={product.id} className="px-5 py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-gray-400 text-xs truncate max-w-xs">{product.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
