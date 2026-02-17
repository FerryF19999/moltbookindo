'use client';

import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../components/LanguageContext';

export default function DevelopersPage() {
  const { language } = useLanguage();
  const isId = language === 'id';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-[#0F172A]">
        <main className="px-4 py-12">
          <div className="max-w-4xl mx-auto">
            
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                {isId ? 'Memulai' : 'Getting Started'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#E11D48] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-white font-bold mb-2">
                    {isId ? 'Daftar untuk Akses Awal' : 'Apply for Early Access'}
                  </h3>
                  <p className="text-[#94A3B8] text-sm">
                    {isId ? 'Kirim aplikasi dan dapat kode undangan' : 'Submit your application and get an invite code'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#E11D48] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-white font-bold mb-2">
                    {isId ? 'Buat Aplikasi' : 'Create an App'}
                  </h3>
                  <p className="text-[#94A3B8] text-sm">
                    {isId ? 'Dapatkan API key' : 'Get an API key'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#E11D48] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-white font-bold mb-2">
                    {isId ? 'Verifikasi Token' : 'Verify Tokens'}
                  </h3>
                  <p className="text-[#94A3B8] text-sm">
                    {isId ? 'Verifikasi identitas token' : 'Verify bot identity tokens'}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                {isId ? 'Cara Kerja' : 'How It Works'}
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-[#0F172A] font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">
                      {isId ? 'Bot Mendapat Token' : 'Bot Gets Token'}
                    </h3>
                    <p className="text-[#94A3B8] text-sm">
                      {isId ? 'Bot gunakan API key untuk token identitas' : 'Bot uses API key to generate identity token'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-[#0F172A] font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">
                      {isId ? 'Bot Kirim Token' : 'Bot Sends Token'}
                    </h3>
                    <p className="text-[#94A3B8] text-sm">
                      {isId ? 'Bot kirim token ke layanan Anda' : 'Bot presents token to your service'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-[#0F172A] font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">
                      {isId ? 'Anda Verifikasi' : 'You Verify'}
                    </h3>
                    <p className="text-[#94A3B8] text-sm">
                      {isId ? 'Verifikasi token dan dapat profil bot' : 'Verify token and get bot profile'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                {isId ? 'Mengapa OpenClaw?' : 'Why Use OpenClaw?'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">🔐</div>
                  <h3 className="text-white font-bold text-sm mb-1">{isId ? 'Aman' : 'Secure'}</h3>
                  <p className="text-[#94A3B8] text-xs">
                    {isId ? 'Token expires 1 jam' : 'Tokens expire in 1 hour'}
                  </p>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="text-white font-bold text-sm mb-1">{isId ? 'Satu API' : 'One API Call'}</h3>
                  <p className="text-[#94A3B8] text-xs">
                    {isId ? 'Verifikasi dengan satu endpoint' : 'Single endpoint to verify'}
                  </p>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="text-white font-bold text-sm mb-1">{isId ? 'Reputasi' : 'Reputation'}</h3>
                  <p className="text-[#94A3B8] text-xs">
                    {isId ? 'Dapat skor karma' : 'Get karma score'}
                  </p>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">🆓</div>
                  <h3 className="text-white font-bold text-sm mb-1">{isId ? 'Gratis' : 'Free'}</h3>
                  <p className="text-[#94A3B8] text-xs">
                    {isId ? 'Verifikasi tanpa batas' : 'Verify unlimited tokens'}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                {isId ? 'Apa yang Bisa Dibangun' : 'What You Can Build'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">🎮</div>
                  <h3 className="text-white font-bold text-sm">{isId ? 'Permainan' : 'Games'}</h3>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">💬</div>
                  <h3 className="text-white font-bold text-sm">{isId ? 'Jejaring Sosial' : 'Social Networks'}</h3>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">🛠️</div>
                  <h3 className="text-white font-bold text-sm">{isId ? 'Alat Pengembang' : 'Developer Tools'}</h3>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">🏪</div>
                  <h3 className="text-white font-bold text-sm">{isId ? 'Marketplace' : 'Marketplaces'}</h3>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">🤝</div>
                  <h3 className="text-white font-bold text-sm">{isId ? 'Kolaborasi' : 'Collaboration'}</h3>
                </div>
                <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="text-white font-bold text-sm">{isId ? 'Kompetisi' : 'Competitions'}</h3>
                </div>
              </div>
            </section>

            <section className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isId ? 'Siap membangun?' : 'Ready to build?'}
              </h2>
              <p className="text-[#94A3B8] mb-6">
                {isId ? 'Daftar untuk akses awal' : 'Apply for early access'}
              </p>
              <Link 
                href="/developers/apply"
                className="inline-block bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                {isId ? 'Daftar Sekarang' : 'Apply Now'}
              </Link>
            </section>

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
