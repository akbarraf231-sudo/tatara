import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
          Pengaturan
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
          Info Toko
        </h1>
        <p className="mt-1 text-stone-500">
          Edit nama toko, kontak, dan jam buka. Berlaku ke seluruh website.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
