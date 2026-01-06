import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { inter } from '@/lib/fonts';
import { cn } from "@/lib/utils";
import type { Viewport } from "next";
import Script from 'next/script';
import "../globals.css";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LanguagePromptDialog } from '@/components/language-prompt-dialog';
import { GlobalGenerationIndicator } from "@/components/global-generation-indicator";
import { EmojiGroupsProvider } from "@/store/emoji-groups-provider";
import { AuthHydration } from "@/components/auth-hydration";
import { BackToTop } from "@/components/back-to-top";

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// 为静态生成提供所有支持的语言
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: Props) {
  const { locale } = await props.params;
  const { children } = props;
  // 验证语言参数
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // 启用静态渲染
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://store.genmojionline.com" />
        <link rel="preconnect" href="https://gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
      </head>
      <body className={cn(
        inter.className,
        'min-h-screen bg-background antialiased'
      )}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="genmoji-theme"
            disableTransitionOnChange
          >
            <AuthHydration>
              <EmojiGroupsProvider locale={locale}>
                <Header />
                {children}
                <Footer />
                <LanguagePromptDialog />
                <TailwindIndicator />
                <GlobalGenerationIndicator />
                <BackToTop />
              </EmojiGroupsProvider>
            </AuthHydration>
            <GoogleAnalytics gaId="G-6T495VYMD7" />
            <GoogleTagManager gtmId="GTM-T3RLKMJR" />
            {/* AdSense - loaded after page is interactive to avoid blocking render */}
            <Script
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1555702340859042"
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 