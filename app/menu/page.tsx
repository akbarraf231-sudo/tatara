import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { getActiveProducts } from "@/lib/products";

export const revalidate = 30;

export const metadata = {
  title: "Menu — Sinar Jaya Bakery",
  description: "Pilih roti, kue, dan pastry yang tersedia hari ini.",
};

export default async function MenuPage() {
  const products = await getActiveProducts();

  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        <section className="border-b border-stone-200 bg-white py-10">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
              Menu
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
              Yang tersedia hari ini
            </h1>
            <p className="mt-2 max-w-xl text-stone-500">
              Stok terbatas, dipanggang fresh setiap pagi. Pilih, masukkan
              keranjang, ambil di toko.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-16 text-center">
              <p className="text-4xl">🍞</p>
              <p className="mt-4 font-serif text-xl text-stone-700">
                Belum ada menu aktif
              </p>
              <p className="mt-1 text-sm text-stone-500">
                Owner sedang menyiapkan stok. Coba lagi sebentar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
