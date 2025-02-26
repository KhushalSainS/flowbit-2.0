import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth/next';

export default async function Home() {
  const session = await getServerSession();
  
  return (
    <div className="flex flex-col space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Intelligent Document Processing
          <span className="text-indigo-600"> Simplified</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
          Transform how you work with documents using our AI-powered platform for analysis, extraction, and management.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {session ? (
            <Link 
              href="/documents" 
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/api/auth/signin" 
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
              <Link 
                href="#features" 
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition"
              >
                Learn More
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Document Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Extract valuable insights from documents using advanced AI algorithms.
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Intelligent Search</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Find information across all your documents with semantic search capabilities.
            </p>
          </div>
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Secure Storage</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep your documents safe with end-to-end encryption and secure access controls.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
