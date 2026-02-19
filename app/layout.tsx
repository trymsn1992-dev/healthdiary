import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for premium feel
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Diary",
  description: "Track your health and wellness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-950 text-neutral-200 antialiased`}>
        <div className="max-w-md mx-auto min-h-screen relative pb-24 shadow-2xl shadow-black bg-neutral-950 border-x border-neutral-900">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
