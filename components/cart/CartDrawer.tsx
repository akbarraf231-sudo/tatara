"use client";

import { formatRupiah } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartProvider";

export default function CartDrawer() {
  const { items, isOpen, close, setQuantity, removeItem, total, count } = useCart();

  // Lock scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-50 bg-stone-900/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Keranjang belanja"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h2 className="font-serif text-xl text-stone-900">
            Keranjang {count > 0 && <span className="text-stone-400">({count})</span>}
          </h2>
          <button
            onClick={close}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100"
            aria-label="Tutup"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-stone-100 text-2xl">
              🥐
            </div>
            <p className="font-serif text-lg text-stone-800">
              Keranjang masih kosong
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Yuk pilih roti & kue favoritmu di menu.
            </p>
            <Link
              href="/menu"
              onClick={close}
              className="mt-6 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-700"
            >
              Lihat Menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-stone-100 overflow-y-auto px-5">
              {items.map((it) => (
                <li key={it.variantId} className="flex gap-3 py-4">
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
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {it.productName}
                        </p>
                        <p className="truncate text-xs text-stone-500">
                          {it.variantName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(it.variantId)}
                        className="text-xs text-stone-400 hover:text-rose-700"
                        aria-label="Hapus item"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-stone-200">
                        <button
                          onClick={() => setQuantity(it.variantId, it.quantity - 1)}
                          className="grid h-7 w-7 place-items-center text-stone-700 hover:bg-stone-50"
                          aria-label="Kurangi"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-medium tabular-nums">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(it.variantId, it.quantity + 1)}
                          disabled={it.quantity >= it.maxStock}
                          className="grid h-7 w-7 place-items-center text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                          aria-label="Tambah"
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

            <div className="border-t border-stone-100 bg-stone-50/60 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-stone-600">Total</span>
                <span className="font-serif text-2xl font-semibold text-stone-900">
                  {formatRupiah(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className="block w-full rounded-full bg-rose-700 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-rose-800"
              >
                Lanjut ke Checkout →
              </Link>
              <p className="mt-2 text-center text-xs text-stone-400">
                Self-pickup only · Tidak ada pengiriman
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
