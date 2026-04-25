"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProduct(
  name: string,
  description: string,
  imageUrl: string | null
) {
  if (!name.trim()) return { error: "Nama wajib diisi" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: name.trim(),
      description: description.trim(),
      image_url: imageUrl?.trim() || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/menu");
  return { id: data.id };
}

export type UpdateImageResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateProductImage(
  productId: string,
  imageUrl: string | null
): Promise<UpdateImageResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      image_url: imageUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/menu");
  return { ok: true };
}

export async function createVariant(
  productId: string,
  name: string,
  price: number,
  stockConversion: number
) {
  if (!name.trim() || price <= 0) return { error: "Data tidak valid" };

  const supabase = await createClient();

  const { data: variant, error } = await supabase
    .from("variants")
    .insert({
      product_id: productId,
      name: name.trim(),
      price,
      stock_conversion: stockConversion,
      status: "active",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Initialize stock at 0
  await supabase.from("stock").insert({
    variant_id: variant.id,
    quantity_available: 0,
    quantity_reserved: 0,
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/stock");
  return { id: variant.id };
}

export async function toggleProductStatus(productId: string, currentStatus: string) {
  const supabase = await createClient();
  await supabase
    .from("products")
    .update({ status: currentStatus === "active" ? "inactive" : "active" })
    .eq("id", productId);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/menu");
}
