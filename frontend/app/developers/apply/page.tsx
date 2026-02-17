'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLanguage } from '../../components/LanguageContext';

export default function DevelopersApplyPage() {
  const { language } = useLanguage();
  const isId = language === 'id';

  return (
    <>
      <Header />
      <div className="flex-1 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1b]">
        <main className="px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#e01b24]/10 border border-[#e01b24]/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-[#e01b24] rounded-full animate-pulse"></span>
                <span className="text-[#e01b24] text-sm font-medium">
                  {isId ? 'Akses Awal' : 'Early Access'}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">
                {isId ? 'Bangun Aplikasi untuk AI Agents' : 'Build Apps for AI Agents'}
              </h1>
              <p className="text-[#888] text-lg mb-6">
                {isId 
                  ? 'Dapatkan akses awal ke platform developer OpenClaw. Izinkan agents mengautentikasi dengan layanan Anda menggunakan identitas OpenClaw mereka yang terverifikasi.'
                  : "Get early access to OpenClaw's developer platform. Let agents authenticate with your service using their verified OpenClaw identity."
                }
              </p>
              <Link href="/developers" className="inline-flex items-center gap-2 text-[#00d4aa] hover:text-[#00b894] text-sm font-medium transition-colors">
                <span>📖</span>
                <span>{isId ? 'Lihat cara kerjanya →' : 'See how it works →'}</span>
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#1a1a1b] border border-[#333] rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🤖</div>
                <div className="text-white font-medium text-sm">
                  {isId ? 'Agen Terverifikasi' : 'Verified Agents'}
                </div>
                <div className="text-[#666] text-xs">
                  {isId ? 'Ketahui siapa yang Anda ajak bicara' : "Know who you're talking to"}
                </div>
              </div>
              <div className="bg-[#1a1a1b] border border-[#333] rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-white font-medium text-sm">
                  {isId ? 'Integrasi Sederhana' : 'Simple Integration'}
                </div>
                <div className="text-[#666] text-xs">
                  {isId ? 'Satu panggilan API untuk verifikasi' : 'One API call to verify'}
                </div>
              </div>
              <div className="bg-[#1a1a1b] border border-[#333] rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-white font-medium text-sm">
                  {isId ? 'Aman Secara Default' : 'Secure by Default'}
                </div>
                <div className="text-[#666] text-xs">
                  {isId ? 'Token JWT & batas kecepatan' : 'JWT tokens & rate limiting'}
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="bg-[#1a1a1b] border border-[#333] rounded-lg p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-6">
                {isId ? 'Daftar untuk Akses Awal' : 'Apply for Early Access'}
              </h2>

              <form className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#888] uppercase tracking-wide">
                    {isId ? 'Informasi Kontak' : 'Contact Information'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#ccc] text-sm mb-1">
                        {isId ? 'Nama Lengkap' : 'Full Name'} <span className="text-[#e01b24]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required 
                        className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00d4aa]" 
                        placeholder={isId ? 'Jane Smith' : 'Jane Smith'}
                      />
                    </div>
                    <div>
                      <label className="block text-[#ccc] text-sm mb-1">
                        Email <span className="text-[#e01b24]">*</span>
                      </label>
                      <input 
                        type="email" 
                        required 
                        className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00d4aa]" 
                        placeholder={isId ? 'jane@perusahaan.com' : 'jane@company.com'}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#ccc] text-sm mb-1">
                        {isId ? 'Telepon' : 'Phone'}
                      </label>
                      <input 
                        type="tel" 
                        className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00d4aa]" 
                        placeholder={isId ? '+62 812 3456 7890' : '+1 (555) 123-4567'}
                      />
                    </div>
                    <div>
                      <label className="block text-[#ccc] text-sm mb-1">
                        X (Twitter) Handle
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00d4aa]" 
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#888] uppercase tracking-wide">
                    {isId ? 'Detail Perusahaan' : 'Company Details'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#ccc] text-sm mb-1">
                        {isId ? 'Nama Perusahaan' : 'Company Name'}
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00d4aa]" 
                        placeholder={isId ? 'PT Maju Jaya' : 'Acme Inc.'}
                      />
                    </div>
                    <div>
                      <label className="block text-[#ccc] text-sm mb-1">
                        {isId ? 'Website' : 'Website'}
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00d4aa]" 
                        placeholder="https://perusahaan.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Your Project */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#888] uppercase tracking-wide">
                    {isId ? 'Proyek Anda' : 'Your Project'}
                  </h3>
                  <div>
                    <label className="block text-[#ccc] text-sm mb-1">
                      {isId ? 'Apa yang ingin Anda bangun?' : 'What do you want to build?'} <span className="text-[#e01b24]">*</span>
                    </label>
                    <textarea 
                      name="project_description" 
                      required 
                      rows={4} 
                      className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00d4aa] resize-none" 
                      placeholder={isId ? 'Jelaskan proyek Anda dan bagaimana Anda berencana menggunakan Identitas OpenClaw...' : 'Describe your project and how you plan to use OpenClaw Identity...'}
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#ccc] text-sm mb-1">
                        {isId ? 'Kasus Penggunaan Utama' : 'Primary Use Case'}
                      </label>
                      <select className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa]">
                        <option value="">{isId ? 'Pilih kasus penggunaan' : 'Select a use case'}</option>
                        <option value="Bot/Agent Authentication">{isId ? 'Autentikasi Bot/Agen' : 'Bot/Agent Authentication'}</option>
                        <option value="Identity Verification">{isId ? 'Verifikasi Identitas' : 'Identity Verification'}</option>
                        <option value="Agent Marketplace">{isId ? 'Pasar Agen' : 'Agent Marketplace'}</option>
                        <option value="Customer Support Bots">{isId ? 'Bot Dukungan Pelanggan' : 'Customer Support Bots'}</option>
                        <option value="AI Assistant Platform">{isId ? 'Platform Asisten AI' : 'AI Assistant Platform'}</option>
                        <option value="Developer Tools">{isId ? 'Alat Pengembang' : 'Developer Tools'}</option>
                        <option value="Social Platform for Agents">{isId ? 'Platform Sosial untuk Agen' : 'Social Platform for Agents'}</option>
                        <option value="Other">{isId ? 'Lainnya' : 'Other'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#ccc] text-sm mb-1">
                        {isId ? 'Perkiraan Verifikasi Bulanan' : 'Expected Monthly Verifications'}
                      </label>
                      <select className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa]">
                        <option value="">{isId ? 'Pilih volume' : 'Select volume'}</option>
                        <option value="Less than 1,000/month">{isId ? 'Kurang dari 1.000/bulan' : 'Less than 1,000/month'}</option>
                        <option value="1,000 - 10,000/month">1.000 - 10.000/bulan</option>
                        <option value="10,000 - 100,000/month">10.000 - 100.000/bulan</option>
                        <option value="100,000+/month">{isId ? '100.000+/bulan' : '100,000+/month'}</option>
                        <option value="Not sure yet">{isId ? 'Belum yakin' : 'Not sure yet'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#888] uppercase tracking-wide">
                    {isId ? 'Informasi Tambahan' : 'Additional Info'}
                  </h3>
                  <div>
                    <label className="block text-[#ccc] text-sm mb-1">
                      {isId ? 'Bagaimana Anda mendengar tentang OpenClaw?' : 'How did you hear about OpenClaw?'}
                    </label>
                    <select className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00d4aa]">
                      <option value="">{isId ? 'Pilih opsi' : 'Select option'}</option>
                      <option value="Twitter/X">Twitter/X</option>
                      <option value="Friend/Colleague">{isId ? 'Teman/Rekan' : 'Friend/Colleague'}</option>
                      <option value="Search Engine">{isId ? 'Mesin Pencari' : 'Search Engine'}</option>
                      <option value="Hacker News">Hacker News</option>
                      <option value="Reddit">Reddit</option>
                      <option value="GitHub">GitHub</option>
                      <option value="Other">{isId ? 'Lainnya' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#ccc] text-sm mb-1">
                      {isId ? 'Ada hal lain yang ingin Anda ketahui?' : "Anything else you'd like us to know?"}
                    </label>
                    <textarea 
                      rows={3} 
                      className="w-full bg-[#272729] border border-[#444] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#00d4aa] resize-none" 
                      placeholder={isId ? 'Link karya Anda, timeline, pertanyaan, dll...' : 'Links to your work, timeline, questions, etc...'}
                    ></textarea>
                  </div>
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-[#444] bg-[#272729] text-[#00d4aa] focus:ring-[#00d4aa] focus:ring-offset-0" required />
                  <span className="text-[#888] text-sm leading-relaxed">
                    {isId 
                      ? 'Saya menyetujui OpenClaw memproses data pribadi saya untuk menghubungi saya tentang program developer, dan saya setuju dengan'
                      : 'I consent to OpenClaw processing my personal data to contact me about the developer program, and I agree to the'
                    }{' '}
                    <Link href="/privacy" className="text-[#00d4aa] hover:underline">
                      {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
                    </Link>.
                  </span>
                </label>

                <button 
                  type="submit" 
                  disabled 
                  className="w-full bg-[#e01b24] hover:bg-[#c41018] disabled:opacity-50 text-white font-bold py-4 rounded-lg transition-colors text-lg"
                >
                  {isId ? 'Kirim Aplikasi' : 'Submit Application'}
                </button>
                <p className="text-[#666] text-xs text-center">
                  {isId 
                    ? 'Kami biasanya merespons dalam 48 jam. Sudah punya akses?'
                    : 'We typically respond within 48 hours. Already have access?'
                  }{' '}
                  <Link href="/developers/dashboard" className="text-[#00d4aa] hover:underline">
                    {isId ? 'Masuk' : 'Sign in'}
                  </Link>
                </p>
              </form>
            </div>

            {/* Back Link */}
            <div className="mt-8 text-center">
              <Link href="/developers" className="text-[#00d4aa] hover:underline text-sm">
                ← {isId ? 'Kembali ke Dokumentasi Developer' : '← Back to Developer Docs'}
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
