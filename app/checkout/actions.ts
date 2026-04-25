"use server";

import { createClient } from "@/lib/supabase/server";

type PlaceOrderItem = { variant_id: string; quantity: number };

type PlaceOrderInput = {
  customerName: string;
  whatsapp: string;
  pickupDate: string; // YYYY-MM-DD
  notes: string;
  idempotencyKey: string;
  items: PlaceOrderItem[];
};

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!input.customerName.trim()) return { ok: false, error: "Nama wajib diisi" };
  if (!input.whatsapp.trim()) return { ok: false, error: "Nomor WhatsApp wajib diisi" };
  if (!input.pickupDate) return { ok: false, error: "Tanggal ambil wajib diisi" };
  if (!input.items.length) return { ok: false, error: "Keranjang kosong" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: input.customerName.trim(),
    p_whatsapp: input.whatsapp.trim(),
    p_pickup_date: input.pickupDate,
    p_items: input.items,
    p_idempotency_key: input.idempotencyKey,
    p_notes: input.notes.trim() || null,
  });

  if (error) return { ok: false, error: error.message };

  const result = data as { success: boolean; order_id?: string; error?: string };
  if (!result.success) {
    return { ok: false, error: result.error ?? "Gagal membuat pesanan" };
  }
  return { ok: true, orderId: result.order_id! };
}
