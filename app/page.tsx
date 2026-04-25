import Header from '@/components/Header'
import Link from 'next/link'

const SPECIAL_ORDER_EMAIL = 'kerjadigital231@gmail.com'

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-amber-50">

        {/* Hero */}
        <section className="bg-gradient-to-br from-amber-800 to-amber-600 py-24 text-center px-4">
          <p className="text-amber-200 text-sm font-semibold uppercase tracking-widest mb-3">
            Homemade · Fresh Daily · Self-Pickup
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Tatara Bakery
          </h1>
          <p className="text-amber-100 text-lg max-w-xl mx-auto mb-8">
            Kue dan roti buatan tangan dengan bahan pilihan. Dibuat setiap hari, diambil langsung — tanpa pengiriman.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-block bg-white text-amber-800 px-8 py-3 rounded-full font-bold hover:bg-amber-50 transition"
            >
              Lihat Menu
            </Link>
            <a
              href={`mailto:${SPECIAL_ORDER_EMAIL}`}
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-amber-800 transition"
            >
              Special Order
            </a>
          </div>
        </section>

        {/* Cara Order */}
        <section className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-amber-900 text-center mb-3">
            Cara Pemesanan
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Semua pesanan diambil sendiri — kami tidak melayani pengiriman.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Pesanan Harian */}
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🛒</span>
                <h3 className="text-xl font-bold text-amber-900">Pesanan Harian</h3>
              </div>
              <p className="text-gray-600 mb-5">
                Pesan hari ini, ambil hari ini. Ketersediaan tergantung stok yang sudah dipanggang.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">✓</span>
                  Cek stok tersedia di halaman menu
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">✓</span>
                  Pilih produk dan tanggal ambil
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">✓</span>
                  Ambil sendiri di lokasi kami
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">✗</span>
                  Tidak tersedia pengiriman
                </li>
              </ul>
              <Link
                href="/products"
                className="block text-center bg-amber-700 text-white py-2.5 rounded-xl font-semibold hover:bg-amber-800 transition"
              >
                Pesan Sekarang
              </Link>
            </div>

            {/* Special Order */}
            <div className="bg-amber-900 rounded-2xl p-7 shadow-sm text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">🎂</div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎂</span>
                <h3 className="text-xl font-bold">Special Order</h3>
              </div>
              <p className="text-amber-200 mb-5">
                Kue ulang tahun, hampers, atau pesanan khusus lainnya. Hubungi kami terlebih dahulu untuk ketersediaan dan tenggat waktu pemesanan.
              </p>
              <ul className="space-y-2 text-sm text-amber-100 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">✓</span>
                  Kue custom sesuai keinginan
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">✓</span>
                  Hampers & gift box
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">✓</span>
                  Pesanan dalam jumlah banyak
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-300 font-bold mt-0.5">!</span>
                  Waktu pemesanan ditentukan oleh owner
                </li>
              </ul>
              <a
                href={`mailto:${SPECIAL_ORDER_EMAIL}?subject=Special Order Tatara Bakery&body=Halo, saya ingin melakukan special order.%0A%0ANama:%0AJenis pesanan:%0ATanggal ambil yang diinginkan:%0AKeterangan tambahan:`}
                className="block text-center bg-white text-amber-900 py-2.5 rounded-xl font-semibold hover:bg-amber-50 transition"
              >
                Hubungi via Email
              </a>
            </div>

          </div>
        </section>

        {/* Info Pengambilan */}
        <section className="bg-white border-t border-amber-100 py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Informasi Penting</h2>
            <p className="text-gray-500 mb-8">Harap dibaca sebelum melakukan pemesanan</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="bg-amber-50 rounded-xl p-5">
                <div className="text-2xl mb-2">📍</div>
                <p className="font-semibold text-amber-900 mb-1">Self-Pickup Only</p>
                <p className="text-gray-500">Tidak ada layanan pengiriman. Pesanan diambil langsung di tempat kami.</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-5">
                <div className="text-2xl mb-2">📅</div>
                <p className="font-semibold text-amber-900 mb-1">Pesanan Harian</p>
                <p className="text-gray-500">Dapat dipesan dan diambil di hari yang sama, selama stok masih tersedia.</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-5">
                <div className="text-2xl mb-2">⏳</div>
                <p className="font-semibold text-amber-900 mb-1">Special Order</p>
                <p className="text-gray-500">Tenggat waktu pemesanan ditentukan oleh owner. Hubungi kami lebih awal.</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 rounded-xl inline-block">
              <p className="text-gray-600 text-sm">
                Ada pertanyaan? Email kami di{' '}
                <a href={`mailto:${SPECIAL_ORDER_EMAIL}`} className="text-amber-700 font-semibold hover:underline">
                  {SPECIAL_ORDER_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
