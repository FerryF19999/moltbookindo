'use client';

import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OwnerAuthCard from '../components/OwnerAuthCard';

export default function LoginPage() {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className="flex-1">
        <div className="min-h-screen bg-[#F7F7FB] flex items-center justify-center p-4 py-12">
          <OwnerAuthCard onAuthenticated={() => router.refresh()} />
        </div>
      </div>
      <Footer />
    </>
  );
}
