import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/Footer";
import HiddenGear from "@/components/HiddenGear";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Tentang — Tatara Bakery",
};

export default function TentangPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose-700">
            Tentang
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-stone-900 md:text-5xl">
            Dapur kecil. Hasil yang serius.
          </h1>

          <div className="mt-8 space-y-5 text-stone-700">
            <p>
              Tatara adalah toko roti rumahan yang fokus pada satu hal: roti
              dan kue yang benar-benar fresh, dibuat dalam jumlah kecil setiap
              hari. Kami memilih bahan dengan cermat, memberi adonan waktu
              cukup untuk berkembang, dan memanggang dengan suhu yang pas.
            </p>
            <p>
              Karena dibuat manual dan dalam jumlah terbatas, kami tidak
              melayani pengiriman. Semua pesanan diambil sendiri di toko —
              biar Anda mendapatkannya saat masih hangat dan kami tidak
              mengompromikan kualitas dalam perjalanan.
            </p>
            <p>
              Untuk kue ulang tahun, hampers, atau pesanan dalam jumlah besar,
              hubungi kami via email terlebih dahulu. Tenggat waktu kami atur
              berdasarkan jenis pesanan.
            </p>
          </div>

          <div className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-stone-100">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              Hubungi Kami
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li>
                Email:{" "}
                <a
                  href="mailto:kerjadigital231@gmail.com"
                  className="text-rose-700 hover:underline"
                >
                  kerjadigital231@gmail.com
                </a>
              </li>
              <li>WhatsApp: 0812-XXXX-XXXX</li>
              <li>Buka: Senin – Minggu, 07.00 – 21.00</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
      <HiddenGear />
    </>
  );
}
