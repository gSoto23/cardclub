import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cardclubcr.com"),
  title: "Card Club | Sealed is meant to be opened",
  description: "El mercado definitivo y la arena competitiva para verdaderos jugadores de TCG en Costa Rica. Compra, vende y domina el juego.",
  keywords: ["TCG Costa Rica", "Cartas Coleccionables", "Subastas TCG", "Torneos TCG", "Pokémon TCG Costa Rica", "Card Club"],
  authors: [{ name: "Card Club" }],
  openGraph: {
    title: "Card Club | El Ecosistema TCG en Costa Rica",
    description: "Compra cartas sueltas, participa en subastas en vivo y compite en torneos oficiales. Únete a la comunidad definitiva.",
    url: "https://cardclubcr.com",
    siteName: "Card Club",
    images: [
      {
        url: "/fav/ms-icon-310x310.png",
        width: 310,
        height: 310,
        alt: "Card Club Logo",
      },
    ],
    locale: "es_CR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Card Club | TCG en Costa Rica",
    description: "Compra, vende y compite en el mejor ecosistema de TCG.",
    images: ["/fav/ms-icon-310x310.png"],
  },
  icons: {
    icon: [
      { url: "/fav/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/fav/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/fav/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/fav/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
      { url: "/fav/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/fav/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/fav/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/fav/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/fav/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/fav/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/fav/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/fav/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/fav/apple-icon-precomposed.png",
      },
      {
        rel: "manifest",
        url: "/fav/manifest.json",
      }
    ],
  },
  manifest: "/fav/manifest.json",
};

import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden w-full max-w-full">
        <CartProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#1A1D2B',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
              },
            }}
          />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
