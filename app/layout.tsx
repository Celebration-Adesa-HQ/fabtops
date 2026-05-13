import type { Metadata } from 'next';
import { Raleway, Playfair_Display } from 'next/font/google';
import '../styles/globals.css';

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FabTops | Digital Flagship Store',
  description: 'Contemporary, premium fashion for the modern woman. Sophisticated, feminine, and powerful.',
  viewport: 'width=device-width, initial-scale=1',
};

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CurrencyProvider } from '@/lib/currency-context';
import { FavoritesProvider } from '@/lib/favorites-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${raleway.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col">
        <CurrencyProvider>
          <FavoritesProvider>
            <CartProvider>
              <Header />
              <CartDrawer />
              
              <main className="flex-grow">
                {children}
              </main>

              <Footer />
            </CartProvider>
          </FavoritesProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
