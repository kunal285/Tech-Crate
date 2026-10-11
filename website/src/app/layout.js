import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  metadataBase: new URL('https://techcrate.in'),
  title: 'TechCrate — Electronic Components, DIY Maker Kits & Microcontrollers',
  description:
    'Shop authentic Arduino, ESP32, Raspberry Pi, robotics parts, sensor modules, and IoT DIY kits in India. Fast campus delivery, instant UPI, verified datasheets & project code.',
  keywords: [
    'TechCrate',
    'Arduino',
    'ESP32',
    'Raspberry Pi',
    'Sensors',
    'Robotics kits',
    'Electronics components online India',
    'DIY Kits',
  ],
  authors: [{ name: 'TechCrate Team' }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'TechCrate — Electronic Components & DIY Kits',
    description: 'Empowering makers, engineers, and students with authentic robotics and IoT hardware.',
    url: 'https://techcrate.in',
    siteName: 'TechCrate',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-brand-primary selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
