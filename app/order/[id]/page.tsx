import Footer from "@/components/Footer";
import HiddenGear from "@/components/HiddenGear";
import Navbar from "@/components/Navbar";
import { formatDate, formatRupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Pesanan Terkonfirmasi — Tatara Bakery",
};

type RouteParams = { id: string };

type OrderItemRow = {
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  variant: { name: string; product: { name: string } | null } | null;
};

type OrderRow = {
  id: string;
  customer_name: string;
  whatsapp: string;
  pickup_date: string;
  total_amount: number | string;
  status: string;
  notes: string | null;
  created_at: string;
  order_items: OrderItemRow[];
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id, customer_name, whatsapp, pickup_date, total_amount, status, notes, created_at,
      order_items (
        quantity, unit_price, subtotal,
        variant:variant_id ( name, product:product_id ( name ) )
      )
    `
    )
    .eq("id", id)
    .single<OrderRow>();

  if (!order) notFound();

  const waNumber = order.whatsapp.replace(/[^0-9]/g, "");
  const waMessage = encodeURIComponent(
    `Halo, saya ${order.customer_name}, baru saja memesan di Tatara Bakery dengan nomor pesanan ${order.id.slice(0, 8)}. Mohon konfirmasi.`
  );

  return (
    <>
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-100">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl">
              ✓
            </div>
            <h1 className="mt-5 font-serif text-3xl font-semibold text-stone-900">
              Pesanan diterima!
            </h1>
            <p className="mt-2 text-stone-500">
              Terima kasih, {order.customer_name}. Pesananmu sudah masuk ke
              dapur kami.
            </p>

            <div className="mt-6 rounded-2xl bg-stone-50 px-4 py-3 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Nomor pesanan</span>
                <span className="font-mono text-stone-900">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-stone-500">Ambil pada</span>
                <span className="font-medium text-stone-900">
                  {formatDate(order.pickup_date)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Rincian pesanan
            </h2>
            <ul className="mt-4 divide-y divide-stone-100">
              {order.order_items.map((it, i) => (
                <li key={i} className="flex justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      {it.variant?.product?.name ?? "Produk"}
                    </p>
                    <p className="text-xs text-stone-500">
                      {it.variant?.name} · {it.quantity}× ·{" "}
                      {formatRupiah(Number(it.unit_price))}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">
                    {formatRupiah(Number(it.subtotal))}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-stone-100 pt-4">
              <span className="font-medium text-stone-700">Total</span>
              <span className="font-serif text-xl font-semibold text-stone-900">
                {formatRupiah(Number(order.total_amount))}
              </span>
            </div>
            {order.notes && (
              <p className="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
                <span className="font-medium">Catatan:</span> {order.notes}
              </p>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-rose-50 p-6 ring-1 ring-rose-100">
            <p className="text-sm font-semibold text-rose-800">
              Langkah selanjutnya
            </p>
            <p className="mt-1 text-sm text-rose-700">
              Konfirmasi via WhatsApp agar kami siapkan tepat waktu. Datang ke
              toko sesuai tanggal di atas — pesananmu akan menunggu, hangat dan
              rapi.
            </p>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Konfirmasi via WhatsApp
              </a>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/menu"
              className="text-sm font-semibold text-stone-700 hover:text-rose-700"
            >
              ← Kembali ke menu
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <HiddenGear />
    </>
  );
}
