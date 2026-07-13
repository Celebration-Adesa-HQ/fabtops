import type { Metadata } from "next";
import { Raleway, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../styles/globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fabtops.com.ng"),
  title: {
    default: "FabTops | Contemporary Women’s Fashion Digital Flagship",
    template: "%s | FabTops",
  },
  description:
    "Shop contemporary, premium fashion rooted in confidence and self-expression. Discover meticulously crafted silhouettes for the modern woman.",
  keywords: [
    "women fashion",
    "premium clothing",
    "contemporary style",
    "FabTops",
    "digital flagship",
    "luxury apparel",
    "tops",
    "sets",
    "dresses",
  ],
  authors: [{ name: "FabTops" }],
  creator: "FabTops",
  publisher: "FabTops",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fabtops.com.ng",
    siteName: "FabTops",
    title: "FabTops | Digital Flagship Store",
    description:
      "Sophisticated, feminine, and powerful. Discover the digital flagship of contemporary fashion.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FabTops Premium Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FabTops | Digital Flagship Store",
    description: "Contemporary, premium fashion for the modern woman.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Providers } from "@/components/layout/Providers";
import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from "@/components/seo/StructuredData";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${raleway.variable} ${playfair.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <OrganizationStructuredData />
        <WebsiteStructuredData />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
          <CartDrawer />
          <main className="flex-grow">
            <Header />
            {children}
            <Footer />
          </main>
          <FloatingContact />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
