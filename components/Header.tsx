import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-amber-700 text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          🥐 Tatara Bakery
        </Link>
        <ul className="flex gap-6">
          <li>
            <Link href="/" className="hover:text-amber-200">
              Home
            </Link>
          </li>
          <li>
            <Link href="/products" className="hover:text-amber-200">
              Products
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-amber-200">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
