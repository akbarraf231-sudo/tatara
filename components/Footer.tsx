import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-700 font-serif text-white">
                T
              </span>
              <span className="font-serif text-xl font-semibold text-stone-900">
                Tatara Bakery
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-stone-500">
              Roti, kue, dan pastry homemade dipanggang fresh setiap hari.
              Pesan online, ambil langsung di toko.
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
              <li>
                <a
                  href="mailto:kerjadigital231@gmail.com"
                  className="hover:text-rose-700"
                >
                  kerjadigital231@gmail.com
                </a>
              </li>
              <li>WhatsApp: 0812-XXXX-XXXX</li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
              Jam Buka
            </p>
            <ul className="space-y-1 text-sm text-stone-700">
              <li>Senin – Jumat: 07.00 – 20.00</li>
              <li>Sabtu – Minggu: 08.00 – 21.00</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-stone-200 pt-6 text-xs text-stone-400 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Tatara Bakery. Dibuat dengan cinta.</p>
          <p>Self-pickup only · Tidak ada pengiriman</p>
        </div>
      </div>
    </footer>
  );
}
