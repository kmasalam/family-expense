import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/provider/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Expense Tracker",
  description: "Track your family expenses and income",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          {/* <Toaster position="top-center" /> */}
        </Providers>
      </body>
    </html>
  );
}
