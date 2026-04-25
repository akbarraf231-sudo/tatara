"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type UpdateSettingsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateSettings(
  updates: Record<string, string>
): Promise<UpdateSettingsResult> {
  const supabase = await createClient();

  const rows = Object.entries(updates).map(([key, value]) => ({
    key,
    value: value ?? "",
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("settings")
    .upsert(rows, { onConflict: "key" });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
