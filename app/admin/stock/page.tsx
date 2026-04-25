import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { adjustStock, setStock } from "./actions";

export const dynamic = "force-dynamic";

type StockRow = {
  quantity_available: number;
  variant: {
    id: string;
    name: string;
    price: number;
    status: string;
    product: { name: string } | null;
  } | null;
};

async function getStock() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stock")
    .select(
      `
      quantity_available,
      variant:variant_id (
        id, name, price, status,
        product:product_id ( name )
      )
    `
    )
    .order("quantity_available", { ascending: true });

  return (data ?? []) as unknown as StockRow[];
}

export default async function StockPage() {
  await requireAdmin();
  const stocks = await getStock();

  const empty = stocks.filter((s) => s.quantity_available === 0);
  const low = stocks.filter(
    (s) => s.quantity_available > 0 && s.quantity_available < 10
  );
  const ok = stocks.filter((s) => s.quantity_available >= 10);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
          Stok
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
          Kelola stok
        </h1>

        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-rose-600"></span>
            Habis ({empty.length})
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500"></span>
            Hampir habis ({low.length})
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-600"></span>
            Aman ({ok.length})
          </span>
        </div>
      </div>

      {stocks.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-stone-100">
          <p className="text-4xl">📦</p>
          <p className="mt-4 font-serif text-xl text-stone-800">
            Belum ada varian
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Tambah produk & varian terlebih dahulu di halaman Produk.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {empty.length > 0 && (
            <StockSection title="Habis" items={empty} tone="rose" />
          )}
          {low.length > 0 && (
            <StockSection title="Hampir Habis" items={low} tone="amber" />
          )}
          {ok.length > 0 && (
            <StockSection title="Aman" items={ok} tone="emerald" />
          )}
        </div>
      )}
    </div>
  );
}

function StockSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: StockRow[];
  tone: "rose" | "amber" | "emerald";
}) {
  const tones: Record<typeof tone, string> = {
    rose: "border-rose-200 bg-rose-50",
    amber: "border-amber-200 bg-amber-50",
    emerald: "border-emerald-200 bg-emerald-50",
  };

  return (
    <section className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <h2 className="mb-4 font-serif text-lg font-semibold text-stone-900">
        {title}
      </h2>
      <div className="grid gap-3">
        {items.map((s) => (
          <StockItem key={s.variant?.id} stock={s} />
        ))}
      </div>
    </section>
  );
}

function StockItem({ stock }: { stock: StockRow }) {
  const variant = stock.variant;
  if (!variant) return null;

  const statusColor =
    stock.quantity_available === 0
      ? "bg-rose-100 text-rose-800"
      : stock.quantity_available < 10
        ? "bg-amber-100 text-amber-800"
        : "bg-emerald-100 text-emerald-800";

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 ring-1 ring-stone-200/50">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-stone-900">{variant.product?.name}</p>
        <p className="text-xs text-stone-500">{variant.name}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusColor}`}>
          {stock.quantity_available}
        </span>

        <div className="flex gap-1.5">
          <form
            action={async () => {
              "use server";
              await adjustStock(variant.id, -1);
            }}
          >
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-lg bg-stone-100 text-2xl hover:bg-stone-200"
              title="Kurangi 1"
            >
              −
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await adjustStock(variant.id, 1);
            }}
          >
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-lg bg-stone-100 text-xl hover:bg-stone-200"
              title="Tambah 1"
            >
              +
            </button>
          </form>

          <SetStockButton variantId={variant.id} currentQty={stock.quantity_available} />
        </div>
      </div>
    </div>
  );
}

function SetStockButton({
  variantId,
  currentQty,
}: {
  variantId: string;
  currentQty: number;
}) {
  return (
    <form
      action={async (formData) => {
        "use server";
        const qty = parseInt(formData.get("qty") as string) || 0;
        await setStock(variantId, qty);
      }}
      className="flex gap-1"
    >
      <input
        type="number"
        name="qty"
        defaultValue={currentQty}
        min="0"
        className="w-16 rounded-lg border border-stone-200 px-2 py-2 text-center text-sm"
        placeholder="0"
      />
      <button
        type="submit"
        className="rounded-lg bg-stone-700 px-2 text-white text-xs font-medium hover:bg-stone-800"
        title="Set jumlah stok"
      >
        Set
      </button>
    </form>
  );
}
