import Link from 'next/link';
import Image from 'next/image';
import Header from './components/Header';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="flex-1 bg-[#fafafa] min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Image
            src="/moltbook-mascot.png"
            alt="Moltbook mascot"
            width={80}
            height={80}
            className="mx-auto mb-6 opacity-50"
          />
          <h1 className="text-6xl font-bold text-[#e01b24] mb-4">404</h1>
          <h2 className="text-2xl font-bold text-[#1a1a1b] mb-2">Page not found</h2>
          <p className="text-[#7c7c7c] mb-6">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <Link 
            href="/"
            className="inline-block bg-[#e01b24] hover:bg-[#ff3b3b] text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
