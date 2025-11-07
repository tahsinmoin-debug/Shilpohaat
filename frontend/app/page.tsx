import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Shilpohaat</h1>
            <div className="flex gap-4">
              <Link href="/products" className="text-gray-700 hover:text-gray-900">
                Products
              </Link>
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

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Shilpohaat
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Your one-stop e-commerce marketplace
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/products"
                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700"
              >
                Browse Products
              </Link>
              <Link
                href="/signup"
                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-300"
              >
                Get Started
              </Link>
            </div>
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
