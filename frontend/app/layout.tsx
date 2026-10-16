import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from '@/components/ui/sonner';

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "askdb — ask your database in plain English",
  description: "Ask your database questions in plain English and get safe, read-only results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.className} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      <Toaster position="top-center" />
      </body>
    </html>
  );
}
