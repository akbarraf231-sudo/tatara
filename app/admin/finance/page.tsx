import AddExpenseForm from '@/components/admin/AddExpenseForm'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createClient } from '@/lib/supabase/server'

async function getTransactions() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('transactions')
    .select('id, type, amount, description, created_at')
    .order('created_at', { ascending: false })
    .limit(60)

  const todayTx = (data ?? []).filter((t) =>
    t.created_at.startsWith(today)
  )

  const income  = todayTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const expense = todayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return { all: data ?? [], income, expense, profit: income - expense }
}

function fmt(n: number) {
  return `Rp ${Math.abs(n).toLocaleString('id-ID')}`
}

export default async function FinancePage() {
  await requireAdmin()
  const { all, income, expense, profit } = await getTransactions()

  return (
    <div className="p-5 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Keuangan</h1>
        <p className="text-gray-400 text-sm mt-0.5">Ringkasan hari ini</p>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-green-600 font-medium mb-1">Pemasukan</p>
          <p className="text-lg font-bold text-green-700">{fmt(income)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-red-600 font-medium mb-1">Pengeluaran</p>
          <p className="text-lg font-bold text-red-700">{fmt(expense)}</p>
        </div>
        <div className={`rounded-2xl p-4 text-center ${profit >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
          <p className={`text-xs font-medium mb-1 ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Keuntungan</p>
          <p className={`text-lg font-bold ${profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {profit < 0 ? '-' : ''}{fmt(profit)}
          </p>
        </div>
      </div>

      {/* Add expense */}
      <div className="mb-6">
        <AddExpenseForm />
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Riwayat Transaksi</h2>
        </div>
        {all.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">Belum ada transaksi</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {all.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                    t.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {t.type === 'income' ? '↑' : '↓'}
                  </span>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">{t.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(t.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
