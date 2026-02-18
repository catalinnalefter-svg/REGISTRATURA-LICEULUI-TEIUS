import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Această linie este CRUCIALĂ pentru culori

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Registratura Electronica",
  description: "Sistem de gestiune documente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
