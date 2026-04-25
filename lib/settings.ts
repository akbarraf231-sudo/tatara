import { createClient } from "@/lib/supabase/server";

export type Settings = {
  business_name: string;
  tagline: string;
  whatsapp: string;
  special_order_wa: string;
  email: string;
  hours_weekday: string;
  hours_weekend: string;
  address: string;
  hero_image: string;
  story_image: string;
};

const DEFAULTS: Settings = {
  business_name: "Sinar Jaya Bakery",
  tagline: "Roti & kue homemade fresh setiap hari",
  whatsapp: "6285801299758",
  special_order_wa: "6285801299758",
  email: "",
  hours_weekday: "Senin – Jumat: 07.00 – 20.00",
  hours_weekend: "Sabtu – Minggu: 08.00 – 21.00",
  address: "",
  hero_image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=900&q=80",
  story_image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80",
};

export async function getSettings(): Promise<Settings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");

  const settings = { ...DEFAULTS };
  for (const row of data ?? []) {
    if (row.key in settings) {
      (settings as Record<string, string>)[row.key] = row.value;
    }
  }
  return settings;
}

export function waLink(number: string, message?: string): string {
  const cleaned = number.replace(/[^0-9]/g, "");
  const msg = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${cleaned}${msg}`;
}
