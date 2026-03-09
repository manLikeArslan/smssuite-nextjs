import type { Metadata } from "next";
import { Outfit, Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "SMS Manager",
  description: "Advanced SMS campaign management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${geist.variable}`} suppressHydrationWarning>
      <body className="font-outfit antialiased bg-creamy text-navy min-h-screen flex flex-col md:flex-row" suppressHydrationWarning>
        <Sidebar />
        <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
