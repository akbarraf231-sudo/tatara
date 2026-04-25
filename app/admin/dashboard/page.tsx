import { formatRupiah, isoToday } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type LowStockRow = {
  quantity_available: number;
  variant: { name: string; product: { name: string } | null } | null;
};

type PendingOrder = {
  id: string;
  customer_name: string;
  pickup_date: string;
  total_amount: number | string;
};

async function getDashboardData() {
  const supabase = await createClient();
  const today = isoToday();

  const [incomeRes, expenseRes, ordersRes, pendingOrdersRes, lowStockRes] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`),
      supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`),
      supabase
        .from("orders")
        .select("id, status")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`),
      supabase
        .from("orders")
        .select("id, customer_name, pickup_date, total_amount")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("stock")
        .select(
          "quantity_available, variant:variant_id (name, product:product_id (name))"
        )
        .lt("quantity_available", 10)
        .order("quantity_available", { ascending: true })
        .limit(8),
    ]);

  const income =
    incomeRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const expense =
    expenseRes.data?.reduce((s, t) => s + Number(t.amount), 0) ?? 0;
  const ordersToday = ordersRes.data ?? [];
  const pendingOrders = (pendingOrdersRes.data ?? []) as PendingOrder[];
  const lowStock = (lowStockRes.data ?? []) as unknown as LowStockRow[];

  return {
    income,
    expense,
    profit: income - expense,
    ordersTodayCount: ordersToday.length,
    pendingOrders,
    lowStock,
  };
}

export default async function DashboardPage() {
  await requireAdmin();
  const { income, expense, profit, ordersTodayCount, pendingOrders, lowStock } =
    await getDashboardData();

  const todayLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      {/* Heading */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
          {todayLabel}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
          Selamat datang 👋
        </h1>
        <p className="mt-1 text-stone-500">
          Ini ringkasan toko hari ini.
        </p>
      </div>

      {/* Big number cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <BigCard
          label="Pesanan hari ini"
          value={String(ordersTodayCount)}
          tone="rose"
          link="/admin/orders"
          linkLabel="Lihat pesanan →"
        />
        <BigCard
          label="Pemasukan hari ini"
          value={formatRupiah(income)}
          tone="emerald"
        />
        <BigCard
          label="Keuntungan bersih"
          value={formatRupiah(profit)}
          tone={profit >= 0 ? "stone" : "rose"}
          sub={`Pengeluaran: ${formatRupiah(expense)}`}
        />
      </div>

      {/* Action items */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Pending orders */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-stone-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Perlu dikonfirmasi
            </h2>
            {pendingOrders.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {pendingOrders.length} pesanan
              </span>
            )}
          </div>

          {pendingOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">
              Tidak ada pesanan menunggu ✨
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {pendingOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {o.customer_name}
                      </p>
                      <p className="text-xs text-stone-500">
                        Ambil {new Date(o.pickup_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-stone-900">
                      {formatRupiah(Number(o.total_amount))}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/orders"
                className="mt-4 block text-center text-sm font-semibold text-rose-700 hover:underline"
              >
                Kelola semua pesanan →
              </Link>
            </>
          )}
        </section>

        {/* Low stock */}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-stone-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Stok hampir habis
            </h2>
            {lowStock.length > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                {lowStock.length} item
              </span>
            )}
          </div>

          {lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">
              Semua stok aman ✨
            </p>
          ) : (
            <>
              <ul className="space-y-2">
                {lowStock.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {s.variant?.product?.name ?? "-"}
                      </p>
                      <p className="text-xs text-stone-500">
                        {s.variant?.name}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        s.quantity_available === 0
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {s.quantity_available === 0
                        ? "Habis"
                        : `${s.quantity_available} sisa`}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/admin/stock"
                className="mt-4 block text-center text-sm font-semibold text-rose-700 hover:underline"
              >
                Tambah stok →
              </Link>
            </>
          )}
        </section>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickLink href="/admin/orders" icon="🧾" label="Pesanan" />
        <QuickLink href="/admin/stock" icon="📦" label="Stok" />
        <QuickLink href="/admin/products" icon="🍞" label="Produk" />
        <QuickLink href="/admin/finance" icon="💰" label="Keuangan" />
      </div>
    </div>
  );
}

function BigCard({
  label,
  value,
  tone,
  sub,
  link,
  linkLabel,
}: {
  label: string;
  value: string;
  tone: "rose" | "emerald" | "stone";
  sub?: string;
  link?: string;
  linkLabel?: string;
}) {
  const tones: Record<typeof tone, string> = {
    rose: "bg-rose-50 ring-rose-100",
    emerald: "bg-emerald-50 ring-emerald-100",
    stone: "bg-white ring-stone-100",
  };
  return (
    <div className={`rounded-2xl p-5 ring-1 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl font-semibold text-stone-900">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
      {link && (
        <Link href={link} className="mt-3 inline-block text-xs font-semibold text-rose-700 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-100 transition hover:ring-stone-300"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-stone-800">{label}</span>
    </Link>
  );
}
