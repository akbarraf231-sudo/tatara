import AddExpenseForm from "@/components/admin/AddExpenseForm";
import { formatRupiah, isoToday } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TransactionRow = {
  id: string;
  type: string;
  amount: number | string;
  description: string | null;
  created_at: string;
};

async function getTransactions() {
  const supabase = await createClient();
  const today = isoToday();

  const { data } = await supabase
    .from("transactions")
    .select("id, type, amount, description, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as TransactionRow[];
  const todayTx = rows.filter((t) => t.created_at.startsWith(today));

  const income = todayTx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = todayTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  return { allTransactions: rows, income, expense, profit: income - expense };
}

export default async function FinancePage() {
  await requireAdmin();
  const { allTransactions, income, expense, profit } = await getTransactions();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
          Keuangan
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
          Ringkasan keuangan
        </h1>
        <p className="mt-1 text-stone-500">Hari ini</p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        <FinanceCard
          label="Pemasukan"
          amount={income}
          tone="emerald"
        />
        <FinanceCard
          label="Pengeluaran"
          amount={expense}
          tone="rose"
        />
        <FinanceCard
          label="Keuntungan"
          amount={profit}
          tone={profit >= 0 ? "stone" : "rose"}
        />
      </div>

      {/* Add expense form */}
      <div className="mb-8">
        <AddExpenseForm />
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl bg-white ring-1 ring-stone-100">
        <div className="border-b border-stone-100 p-5">
          <h2 className="font-serif text-lg font-semibold text-stone-900">
            Riwayat Transaksi
          </h2>
        </div>

        {allTransactions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-stone-400">
            Belum ada transaksi
          </p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {allTransactions.map((t) => {
              const isIncome = t.type === "income";
              const d = new Date(t.created_at);
              const timeStr = d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-semibold text-white ${
                        isIncome ? "bg-emerald-600" : "bg-rose-600"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {t.description || (isIncome ? "Penjualan" : "Pengeluaran")}
                      </p>
                      <p className="text-xs text-stone-500">{timeStr}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 ml-2 font-semibold text-sm tabular-nums ${
                      isIncome ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {isIncome ? "+" : "−"} {formatRupiah(Number(t.amount))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function FinanceCard({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: number;
  tone: "emerald" | "rose" | "stone";
}) {
  const tones: Record<typeof tone, string> = {
    emerald: "bg-emerald-50 ring-emerald-100",
    rose: "bg-rose-50 ring-rose-100",
    stone: "bg-white ring-stone-100",
  };

  return (
    <div className={`rounded-2xl p-5 ring-1 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl font-semibold text-stone-900">
        {formatRupiah(amount)}
      </p>
    </div>
  );
}
