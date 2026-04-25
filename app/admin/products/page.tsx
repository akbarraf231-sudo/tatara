import {
  AddProductForm,
  AddVariantForm,
  EditProductImage,
} from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { toggleProductStatus } from "./actions";

export const dynamic = "force-dynamic";

type VariantRow = {
  id: string;
  name: string;
  price: number;
  stock_conversion: number;
  status: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  status: string;
  variants: VariantRow[];
};

async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      `
      id, name, description, image_url, status,
      variants (id, name, price, stock_conversion, status)
    `
    )
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as ProductRow[];
}

export default async function ProductsPage() {
  await requireAdmin();
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
          Produk
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
          Kelola produk
        </h1>
        <p className="mt-1 text-stone-500">{products.length} produk terdaftar</p>
      </div>

      {/* Add product form */}
      <div className="mb-8 rounded-2xl bg-white p-6 ring-1 ring-stone-100">
        <h2 className="font-serif text-lg font-semibold text-stone-900">
          Tambah Produk Baru
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Masukkan nama, deskripsi, dan upload foto produk.
        </p>
        <div className="mt-4">
          <AddProductForm />
        </div>
      </div>

      {/* Product list */}
      {products.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-stone-100">
          <p className="text-4xl">🍞</p>
          <p className="mt-4 font-serif text-xl text-stone-800">
            Belum ada produk
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Tambah produk pertama di atas untuk mulai.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductRow }) {
  const statusColor =
    product.status === "active"
      ? "bg-emerald-50 ring-emerald-100"
      : "bg-stone-50 ring-stone-100";

  return (
    <div className={`rounded-2xl p-5 ring-1 ${statusColor}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-serif text-base font-semibold text-stone-900">
              {product.name}
            </p>
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                product.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {product.status === "active" ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          {product.description && (
            <p className="mt-1 text-xs text-stone-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <form
          action={async () => {
            "use server";
            await toggleProductStatus(product.id, product.status);
          }}
          className="shrink-0"
        >
          <button
            type="submit"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              product.status === "active"
                ? "bg-stone-200 text-stone-700 hover:bg-stone-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {product.status === "active" ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>
      </div>

      {/* Image */}
      <div className="mt-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          Foto Produk
        </p>
        <EditProductImage
          productId={product.id}
          currentUrl={product.image_url}
        />
      </div>

      {/* Variants */}
      {product.variants.length > 0 && (
        <div className="mt-4 space-y-1.5 rounded-xl bg-white/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Varian ({product.variants.length})
          </p>
          <ul className="space-y-1">
            {product.variants.map((v) => (
              <li
                key={v.id}
                className="flex justify-between text-xs text-stone-700"
              >
                <span>{v.name}</span>
                <span className="text-stone-500">
                  Rp {Number(v.price).toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add variant */}
      <div className="mt-4 border-t border-white pt-4">
        <AddVariantForm productId={product.id} />
      </div>
    </div>
  );
}
