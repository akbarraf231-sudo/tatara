import { Product } from '@/types/product'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative h-48 w-full">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-amber-900">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-2">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-amber-700 font-bold text-lg">
            Rp {product.price.toLocaleString('id-ID')}
          </span>
          <button className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
