import { createClient } from "@/lib/supabase/server";
import { Product, Variant } from "@/lib/types";

type RawVariant = Omit<Variant, "stock"> & {
  stock: { quantity_available: number } | { quantity_available: number }[] | null;
};

type RawProduct = Omit<Product, "variants"> & { variants: RawVariant[] };

function pickStock(stock: RawVariant["stock"]): number {
  if (!stock) return 0;
  if (Array.isArray(stock)) return stock[0]?.quantity_available ?? 0;
  return stock.quantity_available;
}

export type ProductWithStock = Omit<Product, "variants"> & {
  variants: (Omit<Variant, "stock"> & { stockAvailable: number })[];
};

export async function getActiveProducts(): Promise<ProductWithStock[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      `
      id, name, description, image_url, status,
      variants (
        id, name, price, stock_conversion, status,
        stock ( quantity_available )
      )
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as RawProduct[];

  return rows.map((p) => ({
    ...p,
    variants: (p.variants ?? [])
      .filter((v) => v.status === "active")
      .map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        stock_conversion: v.stock_conversion,
        status: v.status,
        stockAvailable: Math.floor(pickStock(v.stock) / (v.stock_conversion || 1)),
      })),
  }));
}
