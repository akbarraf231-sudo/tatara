"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { href: "/admin/dashboard", icon: "🏠", label: "Beranda" },
  { href: "/admin/orders", icon: "🧾", label: "Pesanan" },
  { href: "/admin/stock", icon: "📦", label: "Stok" },
  { href: "/admin/products", icon: "🍞", label: "Produk" },
  { href: "/admin/finance", icon: "💰", label: "Keuangan" },
  { href: "/admin/settings", icon: "⚙️", label: "Pengaturan" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden shrink-0 flex-col border-r border-stone-200 bg-white md:flex md:w-60">
        <div className="border-b border-stone-100 p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-700 font-serif text-white">
              S
            </span>
            <div>
              <p className="font-serif text-lg font-semibold text-stone-900">
                Sinar Jaya
              </p>
              <p className="text-[11px] text-stone-400">Panel Owner</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-rose-50 text-rose-800"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-100 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-500 hover:bg-stone-50"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white md:hidden">
        <div className="flex justify-around">
          {nav.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center py-2 text-[10px] transition ${
                  active ? "text-rose-700" : "text-stone-500"
                }`}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
