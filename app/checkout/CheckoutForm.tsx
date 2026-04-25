"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatRupiah, isoToday } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { placeOrder } from "./actions";

function genIdempotencyKey() {
  const cryptoApi = typeof crypto !== "undefined" ? crypto : null;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { items, total, clear, setQuantity, removeItem } = useCart();
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const today = isoToday();
  const [pickup, setPickup] = useState(today);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minDate = today;
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  }, []);

  // If cart becomes empty (e.g. after order), bounce home
  useEffect(() => {
    if (!submitting && items.length === 0) {
      // do nothing — UI handles empty state
    }
  }, [items.length, submitting]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await placeOrder({
      customerName: name,
      whatsapp: wa,
      pickupDate: pickup,
      notes,
      idempotencyKey: genIdempotencyKey(),
      items: items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
    });

    if (!res.ok) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    clear();
    router.push(`/order/${res.orderId}`);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-stone-100">
        <p className="text-3xl">🥐</p>
        <p className="mt-4 font-serif text-xl text-stone-800">Keranjang kosong</p>
        <p className="mt-1 text-sm text-stone-500">
          Tambahkan dulu beberapa item dari menu.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
        >
          Lihat Menu
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr,360px]">
      {/* Customer info */}
      <section className="space-y-6">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-100">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            Data Pemesan
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Kami pakai untuk konfirmasi via WhatsApp.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nama lengkap" htmlFor="name">
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="input"
              />
            </Field>
            <Field label="Nomor WhatsApp" htmlFor="wa">
              <input
                id="wa"
                type="tel"
                required
                inputMode="tel"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="input"
              />
            </Field>
            <Field label="Tanggal ambil" htmlFor="pickup">
              <input
                id="pickup"
                type="date"
                required
                min={minDate}
                max={maxDate}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Catatan (opsional)" htmlFor="notes">
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: tanpa wijen"
                className="input"
              />
            </Field>
          </div>

          <p className="mt-4 rounded-xl bg-stone-50 p-3 text-xs text-stone-500">
            ℹ Pesananmu akan diambil di toko. Kami tidak melayani pengiriman.
          </p>
        </div>

        {/* Items list */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-100">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            Pesananmu ({items.length})
          </h2>
          <ul className="mt-4 divide-y divide-stone-100">
            {items.map((it) => (
              <li key={it.variantId} className="flex gap-4 py-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {it.imageUrl ? (
                    <Image
                      src={it.imageUrl}
                      alt={it.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-2xl">
                      🍞
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {it.productName}
                      </p>
                      <p className="text-xs text-stone-500">{it.variantName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(it.variantId)}
                      className="text-xs text-stone-400 hover:text-rose-700"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setQuantity(it.variantId, it.quantity - 1)}
                        className="grid h-7 w-7 place-items-center text-stone-700 hover:bg-stone-50"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-medium tabular-nums">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(it.variantId, it.quantity + 1)}
                        disabled={it.quantity >= it.maxStock}
                        className="grid h-7 w-7 place-items-center text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-stone-900">
                      {formatRupiah(it.price * it.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-stone-100">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            Ringkasan
          </h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Subtotal</dt>
              <dd className="font-medium text-stone-900">
                {formatRupiah(total)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Pengiriman</dt>
              <dd className="text-stone-700">Self-pickup</dd>
            </div>
          </dl>

          <div className="mt-5 flex justify-between border-t border-stone-100 pt-4">
            <span className="font-medium text-stone-700">Total</span>
            <span className="font-serif text-2xl font-semibold text-stone-900">
              {formatRupiah(total)}
            </span>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-full bg-rose-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Memproses..." : "Konfirmasi Pesanan"}
          </button>

          <p className="mt-3 text-center text-[11px] text-stone-400">
            Dengan menekan tombol ini Anda setuju mengambil pesanan di toko
            pada tanggal yang dipilih.
          </p>
        </div>
      </aside>

      {/* Local input style, scoped via class */}
      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e7e5e4;
          background: #fff;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #1c1917;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input::placeholder { color: #a8a29e; }
        .input:focus {
          border-color: #be123c;
          box-shadow: 0 0 0 3px rgba(190,18,60,0.12);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-xs font-medium text-stone-600">{label}</span>
      {children}
    </label>
  );
}
