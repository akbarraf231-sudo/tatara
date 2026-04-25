import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/Footer";
import HiddenGear from "@/components/HiddenGear";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { getActiveProducts } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

export default async function Home() {
  const products = await getActiveProducts();
  const featured = products.slice(0, 4);

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-stone-50">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                Homemade · Fresh setiap hari
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] text-stone-900 md:text-6xl">
                Roti & kue, <br />
                dipanggang <span className="italic text-rose-700">hari ini</span>.
              </h1>
              <p className="mt-5 max-w-md text-base text-stone-600">
                Pesan online, ambil langsung di toko. Tanpa pengiriman, tanpa
                ribet — cukup pilih, jadwalkan ambil, dan nikmati selagi hangat.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
                >
                  Pesan Sekarang
                </Link>
                <Link
                  href="#cara-pesan"
                  className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-400"
                >
                  Cara Pesan
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
                <span>✓ Same-day pickup</span>
                <span>✓ Bahan pilihan</span>
                <span>✓ Tanpa pengawet</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-200 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=900&q=80"
                  alt="Roti hangat baru keluar dari oven"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-stone-100 md:block">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                  Hari ini
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold text-stone-900">
                  {products.reduce((s, p) => s + p.variants.length, 0)} varian
                </p>
                <p className="text-xs text-stone-500">siap diambil</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
                Pilihan Hari Ini
              </p>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
                Yang sedang fresh
              </h2>
            </div>
            <Link
              href="/menu"
              className="hidden text-sm font-semibold text-stone-700 hover:text-rose-700 md:block"
            >
              Lihat semua →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center">
              <p className="text-3xl">🍞</p>
              <p className="mt-3 font-serif text-lg text-stone-700">
                Menu sedang dipersiapkan
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Belum ada produk aktif. Silakan kembali sebentar lagi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Link
              href="/menu"
              className="inline-block text-sm font-semibold text-rose-700"
            >
              Lihat semua menu →
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section
          id="cara-pesan"
          className="bg-white py-16 ring-1 ring-stone-100"
        >
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-rose-700">
              Cara Pesan
            </p>
            <h2 className="mt-2 text-center font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
              Tiga langkah, selesai
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm text-stone-500">
              Tidak perlu daftar akun, tidak perlu install apa-apa. Cukup pilih
              dan ambil di toko.
            </p>

            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  num: "01",
                  title: "Pilih roti & kue",
                  desc: "Lihat menu yang sedang fresh dan tambahkan ke keranjang.",
                },
                {
                  num: "02",
                  title: "Atur tanggal ambil",
                  desc: "Hari yang sama bila tersedia, atau jadwalkan untuk besok.",
                },
                {
                  num: "03",
                  title: "Ambil di toko",
                  desc: "Datang sesuai jadwal — pesananmu sudah siap, hangat dan rapi.",
                },
              ].map((s) => (
                <li key={s.num} className="rounded-2xl bg-stone-50 p-6">
                  <p className="font-serif text-3xl font-semibold text-rose-700">
                    {s.num}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-stone-900">
                    {s.title}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Story */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-stone-200 md:aspect-[4/5]">
              <Image
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80"
                alt="Sourdough bread"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
                Cerita Kami
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-stone-900 md:text-4xl">
                Dibuat dengan tangan, satu loyang dalam satu waktu.
              </h2>
              <p className="mt-4 text-stone-600">
                Tatara adalah dapur rumahan kecil. Setiap pagi kami menimbang
                tepung, membentuk adonan, dan menunggunya naik dengan sabar.
                Tidak ada produksi massal — hanya roti dan kue yang dipanggang
                hari itu, untuk diambil hari itu juga.
              </p>
              <p className="mt-3 text-stone-600">
                Untuk pesanan khusus seperti kue ulang tahun atau hampers,
                hubungi kami via email — tenggat dan ketersediaan kami atur
                bersama.
              </p>
              <a
                href="mailto:kerjadigital231@gmail.com"
                className="mt-6 inline-block rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-stone-500"
              >
                Email untuk Special Order
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="overflow-hidden rounded-[2rem] bg-stone-900 px-6 py-14 text-center text-white md:px-12 md:py-20">
            <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold leading-tight md:text-5xl">
              Pesan sekarang, ambil hari ini juga.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-stone-300">
              Stok terbatas — yang sudah habis, habis. Yang masih ada, hangat
              menunggu.
            </p>
            <Link
              href="/menu"
              className="mt-8 inline-block rounded-full bg-rose-700 px-8 py-3.5 text-sm font-semibold transition hover:bg-rose-800"
            >
              Mulai Pesan
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <HiddenGear />
    </>
  );
}
