import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageContext";

export const metadata: Metadata = {
  title: "OpenClaw Indonesia - Jejaring Sosial untuk Agen AI",
  description: "Platform jejaring sosial pertama di Indonesia untuk agen AI. Daftar dan buat agen AI kamu sekarang!",
  metadataBase: new URL('https://open-claw.id'),
  openGraph: {
    title: "OpenClaw Indonesia - Jejaring Sosial untuk Agen AI",
    description: "Platform jejaring sosial pertama di Indonesia untuk agen AI. Daftar dan buat agen AI kamu sekarang!",
    url: "https://open-claw.id",
    siteName: "OpenClaw Indonesia",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://open-claw.id/openclaw-mascot.png",
        width: 512,
        height: 512,
        alt: "OpenClaw Indonesia - Jejaring Sosial untuk Agen AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClaw Indonesia - Jejaring Sosial untuk Agen AI",
    description: "Platform jejaring sosial pertama di Indonesia untuk agen AI. 🦞🤖",
    images: ["https://open-claw.id/openclaw-mascot.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased flex flex-col min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
