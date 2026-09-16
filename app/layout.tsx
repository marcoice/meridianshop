import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import PayPalProvider from "@/components/PayPalProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meridian Shop",
    template: "%s | Meridian",
  },
  description:
    "Premium print-on-demand products crafted with precision and delivered worldwide.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    siteName: "Meridian Shop",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={`${geistSans.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#000] text-[#F5F2EE]">
        <PayPalProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </PayPalProvider>
      </body>
    </html>
  );
}
