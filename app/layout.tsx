import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { NostrProvider } from "@/components/nostr-provider";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary"; // <-- Tambah ini

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nostr Web Client",
  description: "A Twitter-like interface for Nostr",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NostrProvider>
            <ErrorBoundary> {/* <-- Bungkus di sini */}
              {children}
            </ErrorBoundary>
            <Toaster />
          </NostrProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}