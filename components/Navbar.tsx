"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart/CartProvider";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/menu", label: "Menu" },
  { href: "/tentang", label: "Tentang" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { count, open } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-50/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full bg-rose-700 font-serif text-base text-white"
          >
            T
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-stone-900">
            Tatara
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-stone-700 md:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition hover:text-rose-700 ${
                  active ? "font-semibold text-stone-900" : ""
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={open}
          className="relative rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          aria-label="Buka keranjang"
        >
          Keranjang
          {count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-rose-700 px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
