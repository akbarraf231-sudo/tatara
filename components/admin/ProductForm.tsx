"use client";

import {
  createProduct,
  createVariant,
  updateProductImage,
} from "@/app/admin/products/actions";
import { useState, useTransition } from "react";
import ImageUpload from "./ImageUpload";

export function AddProductForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createProduct(name, desc, imageUrl);
      if (res?.error) {
        setMsg(res.error);
      } else {
        setName("");
        setDesc("");
        setImageUrl(null);
        setMsg("✓ Produk ditambahkan!");
        setTimeout(() => setMsg(""), 2000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-700">
          Nama Produk *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Croissant Butter"
          required
          className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-700/15"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-700">
          Deskripsi
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Keterangan singkat..."
          rows={2}
          className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:border-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-700/15"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-stone-700">
          Foto Produk
        </label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>
      {msg && (
        <p
          className={`text-sm ${
            msg.startsWith("✓") ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {msg}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-rose-700 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-50"
      >
        {isPending ? "Menyimpan..." : "+ Tambah Produk"}
      </button>
    </form>
  );
}

export function EditProductImage({
  productId,
  currentUrl,
}: {
  productId: string;
  currentUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(currentUrl);
  const [msg, setMsg] = useState("");

  function handleChange(newUrl: string | null) {
    setUrl(newUrl);
    startTransition(async () => {
      const res = await updateProductImage(productId, newUrl);
      if (!res.ok) {
        setMsg(res.error);
      } else {
        setMsg("✓ Foto disimpan");
        setTimeout(() => setMsg(""), 2000);
      }
    });
  }

  return (
    <div>
      <ImageUpload value={url} onChange={handleChange} folder={`products/${productId}`} />
      {(isPending || msg) && (
        <p
          className={`mt-1.5 text-xs ${
            msg.startsWith("✓") ? "text-emerald-700" : "text-stone-500"
          }`}
        >
          {isPending ? "Menyimpan..." : msg}
        </p>
      )}
    </div>
  );
}

export function AddVariantForm({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [conv, setConv] = useState("1");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createVariant(
        productId,
        name,
        parseInt(price),
        parseInt(conv)
      );
      if (res?.error) {
        setMsg(res.error);
      } else {
        setName("");
        setPrice("");
        setConv("1");
        setMsg("✓ Varian ditambahkan!");
        setTimeout(() => {
          setMsg("");
          setOpen(false);
        }, 1500);
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-rose-700 hover:underline"
      >
        + Tambah varian
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 space-y-2 rounded-xl border border-rose-100 bg-rose-50/60 p-3"
    >
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-stone-600">
            Nama
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Regular"
            required
            className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs focus:border-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-700/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-stone-600">
            Harga (Rp)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="25000"
            min="0"
            required
            className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs focus:border-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-700/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-stone-600">
            Konversi
          </label>
          <input
            type="number"
            value={conv}
            onChange={(e) => setConv(e.target.value)}
            placeholder="1"
            min="1"
            required
            className="w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs focus:border-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-700/30"
          />
        </div>
      </div>
      {msg && (
        <p
          className={`text-xs ${
            msg.startsWith("✓") ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {msg}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-rose-700 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "..." : "Simpan Varian"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-2 text-xs text-stone-500 hover:text-stone-700"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
