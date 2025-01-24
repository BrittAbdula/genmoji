import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { inter } from '@/lib/fonts';
import { cn } from "@/lib/utils";
import type { Viewport } from "next";
import "./globals.css";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'


export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        inter.className,
        'min-h-screen bg-background antialiased'
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="genmoji-theme"
          disableTransitionOnChange
        >
          {children}
          <TailwindIndicator />
          <GoogleAnalytics gaId="G-6T495VYMD7" />
          <GoogleTagManager gtmId="GTM-T3RLKMJR" />
        </ThemeProvider>
      </body>
    </html>
  );
}
