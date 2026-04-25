import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="bg-gradient-to-r from-amber-100 to-yellow-100 py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-amber-900 mb-4">
              Welcome to Tatara Bakery
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Fresh, delicious baked goods made with love every day
            </p>
            <Link
              href="/products"
              className="inline-block bg-amber-700 text-white px-8 py-4 rounded-lg font-bold hover:bg-amber-800"
            >
              See Our Products
            </Link>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-amber-900 mb-12 text-center">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                Quality Ingredients
              </h3>
              <p className="text-gray-600">
                We use only the finest ingredients sourced locally
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                Expert Bakers
              </h3>
              <p className="text-gray-600">
                Our team of skilled bakers bring passion to every product
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Fresh baked goods delivered to your door
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
