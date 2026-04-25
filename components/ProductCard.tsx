"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatRupiah } from "@/lib/format";
import { ProductWithStock } from "@/lib/products";
import Image from "next/image";
import { useState } from "react";

export default function ProductCard({ product }: { product: ProductWithStock }) {
  const { addItem } = useCart();
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = product.variants[variantIdx];

  if (!variant) return null;

  const inStock = variant.stockAvailable > 0;

  const handleAdd = () => {
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantName: variant.name,
      price: variant.price,
      imageUrl: product.image_url,
      maxStock: variant.stockAvailable,
    });
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100 transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl">🥐</div>
        )}
        {!inStock && (
          <div className="absolute inset-0 grid place-items-center bg-stone-900/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-700">
              Habis
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-base font-semibold leading-tight text-stone-900">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-stone-500">
            {product.description}
          </p>
        )}

        {product.variants.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setVariantIdx(i)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
                  i === variantIdx
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 text-stone-600 hover:border-stone-400"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="font-serif text-lg font-semibold text-stone-900">
            {formatRupiah(variant.price)}
          </p>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="rounded-full bg-rose-700 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
          >
            {inStock ? "+ Tambah" : "Habis"}
          </button>
        </div>
      </div>
    </article>
  );
}
