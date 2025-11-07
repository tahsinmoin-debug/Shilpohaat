import Link from "next/link";

// Mock product data
const products = [
  { id: 1, name: "Product 1", price: 29.99, image: "/placeholder-product.jpg" },
  { id: 2, name: "Product 2", price: 39.99, image: "/placeholder-product.jpg" },
  { id: 3, name: "Product 3", price: 49.99, image: "/placeholder-product.jpg" },
  { id: 4, name: "Product 4", price: 59.99, image: "/placeholder-product.jpg" },
  { id: 5, name: "Product 5", price: 69.99, image: "/placeholder-product.jpg" },
  { id: 6, name: "Product 6", price: 79.99, image: "/placeholder-product.jpg" },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Shilpohaat
            </Link>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Login
              </Link>
              <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Products Gallery */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Gallery</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image</span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2024 Shilpohaat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
