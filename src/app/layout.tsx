import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-base",
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "What's On in Romiley",
  description: "Discover local events, pubs, and restaurants in Romiley, Stockport.",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={figtree.className}>
        <Navbar />
        <main style={{ minHeight: '80vh' }}>
          {children}
        </main>
        {/* The following content seems to be intended for the Footer or a similar section.
            It's placed here as per the provided snippet, but might need adjustment
            depending on the actual desired structure. */}
        <div className="container">
          <p>&copy; {new Date().getFullYear()} What's On in Romiley. All rights reserved.</p>
          <Link href="/" className="logo">
            What's On in Romiley
          </Link>
        </div>
        <Footer />
      </body>
    </html>
  );
}
