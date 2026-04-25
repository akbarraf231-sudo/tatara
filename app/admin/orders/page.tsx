import { formatDate, formatRupiah, isoToday } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  customer_name: string;
  whatsapp: string;
  pickup_date: string;
  total_amount: number | string;
  status: string;
  notes: string | null;
  created_at: string;
};

async function getOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, customer_name, whatsapp, pickup_date, total_amount, status, notes, created_at")
    .gte("pickup_date", isoToday())
    .order("pickup_date", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as OrderRow[];
}

export default async function OrdersPage() {
  await requireAdmin();
  const orders = await getOrders();
  const today = isoToday();

  const todayOrders = orders.filter((o) => o.pickup_date === today);
  const futureOrders = orders.filter((o) => o.pickup_date > today);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
          Pesanan
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
          Kelola pesanan
        </h1>
        <p className="mt-1 text-stone-500">
          Total: {orders.length} pesanan menunggu ambil
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-stone-100">
          <p className="text-4xl">📭</p>
          <p className="mt-4 font-serif text-xl text-stone-800">
            Tidak ada pesanan
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Pesanan akan muncul di sini ketika customer memesan.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {todayOrders.length > 0 && (
            <OrderSection
              title="Hari Ini"
              orders={todayOrders}
              variant="today"
            />
          )}
          {futureOrders.length > 0 && (
            <OrderSection
              title="Mendatang"
              orders={futureOrders}
              variant="future"
            />
          )}
        </div>
      )}
    </div>
  );
}

function OrderSection({
  title,
  orders,
  variant,
}: {
  title: string;
  orders: OrderRow[];
  variant: "today" | "future";
}) {
  const statusOrder = {
    pending: 0,
    confirmed: 1,
    completed: 2,
    cancelled: 3,
  };

  const sorted = [...orders].sort(
    (a, b) =>
      (statusOrder[a.status as keyof typeof statusOrder] ?? 99) -
      (statusOrder[b.status as keyof typeof statusOrder] ?? 99)
  );

  return (
    <section>
      <h2 className="mb-4 font-serif text-lg font-semibold text-stone-900">
        {title}
      </h2>
      <div className="grid gap-3">
        {sorted.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const statusColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    confirmed: "bg-blue-50 text-blue-800 ring-blue-200",
    completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
  };

  const statusLabel: Record<string, string> = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  const waNumber = order.whatsapp.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Halo ${order.customer_name}, pesananmu siap diambil!`
  );

  return (
    <div className={`rounded-2xl p-5 ring-1 ${statusColor[order.status]}`}>
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-base font-semibold text-stone-900">
            {order.customer_name}
          </p>
          <p className="mt-0.5 text-xs text-stone-600">
            #{order.id.slice(0, 8).toUpperCase()} · Ambil{" "}
            {formatDate(order.pickup_date)}
          </p>
          {order.notes && (
            <p className="mt-1 text-xs text-stone-600">
              Catatan: <em>{order.notes}</em>
            </p>
          )}
          <p className="mt-1 font-medium text-stone-900">
            {formatRupiah(Number(order.total_amount))}
          </p>
        </div>

        <div className="flex w-full flex-wrap gap-2 md:w-auto">
          <form
            action={async () => {
              "use server";
              await updateOrderStatus(order.id, "confirmed");
            }}
            className="flex-1 md:flex-none"
          >
            <button
              type="submit"
              className="w-full rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              disabled={order.status === "cancelled"}
            >
              ✓ Konfirmasi
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await updateOrderStatus(order.id, "completed");
            }}
            className="flex-1 md:flex-none"
          >
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              disabled={order.status === "cancelled"}
            >
              ✓ Selesai
            </button>
          </form>

          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full bg-emerald-500 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-emerald-600 md:flex-none"
            >
              💬 WA
            </a>
          )}

          <form
            action={async () => {
              "use server";
              await updateOrderStatus(order.id, "cancelled");
            }}
            className="flex-1 md:flex-none"
          >
            <button
              type="submit"
              className="w-full rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              ✕ Batalkan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
