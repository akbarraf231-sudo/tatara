import { getSettings, waLink } from "@/lib/settings";
import Link from "next/link";

export default async function Footer() {
  const s = await getSettings();
  const initial = s.business_name.trim().charAt(0).toUpperCase() || "S";

  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-700 font-serif text-white">
                {initial}
              </span>
              <span className="font-serif text-xl font-semibold text-stone-900">
                {s.business_name}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-stone-500">
              {s.tagline}. Pesan online, ambil langsung di toko.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
              Jelajahi
            </p>
            <ul className="space-y-2 text-sm text-stone-700">
              <li>
                <Link href="/menu" className="hover:text-rose-700">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-rose-700">
                  Tentang
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
              Kontak
            </p>
            <ul className="space-y-2 text-sm text-stone-700">
              {s.whatsapp && (
                <li>
                  <a
                    href={waLink(s.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-rose-700"
                  >
                    WhatsApp: +{s.whatsapp}
                  </a>
                </li>
              )}
              {s.email && (
                <li>
                  <a
                    href={`mailto:${s.email}`}
                    className="hover:text-rose-700"
                  >
                    {s.email}
                  </a>
                </li>
              )}
              {s.address && <li>{s.address}</li>}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
              Jam Buka
            </p>
            <ul className="space-y-1 text-sm text-stone-700">
              {s.hours_weekday && <li>{s.hours_weekday}</li>}
              {s.hours_weekend && <li>{s.hours_weekend}</li>}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-stone-200 pt-6 text-xs text-stone-400 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {s.business_name}. Dibuat dengan
            cinta.
          </p>
          <p>Self-pickup only · Tidak ada pengiriman</p>
        </div>
      </div>
    </footer>
  );
}
