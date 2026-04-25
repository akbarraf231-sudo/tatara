import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/Footer";
import HiddenGear from "@/components/HiddenGear";
import Navbar from "@/components/Navbar";
import CheckoutForm from "./CheckoutForm";

export const metadata = {
  title: "Checkout — Tatara Bakery",
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
            Checkout
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-stone-900 md:text-4xl">
            Selesaikan pesananmu
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Isi data pemesan dan pilih tanggal ambil di toko.
          </p>

          <div className="mt-8">
            <CheckoutForm />
          </div>
        </section>
      </main>

      <Footer />
      <HiddenGear />
    </>
  );
}
