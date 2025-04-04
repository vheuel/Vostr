import { ErrorBoundary } from "@/components/ErrorBoundary"; // tambahkan ini

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NostrProvider>
            <ErrorBoundary> {/* Tambahkan ini */}
              {children}
            </ErrorBoundary>
            <Toaster />
          </NostrProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}