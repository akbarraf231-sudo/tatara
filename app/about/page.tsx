import Header from '@/components/Header'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-8">About Tatara Bakery</h1>

          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Our Story</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tatara Bakery was founded with a simple mission: to bring the joy of fresh,
              delicious baked goods to our community. Started as a small family business,
              we've grown into a beloved neighborhood bakery known for our commitment to
              quality and tradition.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Every morning, our skilled bakers arrive before dawn to prepare fresh bread,
              pastries, and desserts using time-honored recipes and the finest ingredients.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Our Values</h2>
            <ul className="space-y-4 text-gray-700">
              <li>
                <strong className="text-amber-900">Quality:</strong> We never compromise on ingredients or process
              </li>
              <li>
                <strong className="text-amber-900">Tradition:</strong> We honor time-tested baking methods
              </li>
              <li>
                <strong className="text-amber-900">Community:</strong> We're proud to serve our local community
              </li>
              <li>
                <strong className="text-amber-900">Passion:</strong> Baking is our passion, and it shows in every product
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Contact Us</h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Email:</strong> hello@tatarabakery.com</p>
              <p><strong>Phone:</strong> +62 123 456 7890</p>
              <p><strong>Address:</strong> Jl. Bakery No. 123, Jakarta, Indonesia</p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
