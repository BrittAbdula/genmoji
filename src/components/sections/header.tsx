"use client";

import { Icons } from "@/components/icons";
import { MobileDrawer } from "@/components/mobile-drawer";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { outfit } from '@/lib/fonts';
import { AuroraText } from "@/components/ui/aurora-text";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from 'next-intl';

export function Header() {
  const pathname = usePathname();
  const t = useTranslations('common');
  const nav = useTranslations('common.navigation');

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 p-0 bg-background/60 backdrop-blur">
      <div className="flex justify-between items-center container mx-auto p-2">
        <Link
          href="/"
          title={t('name')}
          className="relative flex items-center space-x-2"
        >
          <img src="/logo.png" alt={t('name')} width="40" height="40"/>
          <motion.div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-pink-100/30 via-purple-100/30 to-transparent dark:from-pink-950/30 dark:via-purple-950/30 rounded-full blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          <p className={cn(
            "text-xl sm:text-2xl font-bold tracking-tight",
            outfit.className
          )}>
            <AuroraText>{t('name').split(' ')[0]}</AuroraText>{" "}
            <span className="text-muted-foreground">{t('name').split(' ')[1]}</span>
          </p>
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive('/') ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {nav('home')}
            </Link>
            <Link
              href="/gallery"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                isActive('/gallery') ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {nav('gallery')}
            </Link>
          </nav>

          <LanguageSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          {/* <div className="hidden lg:block">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-8 text-white rounded-full group"
              )}
            >
              {t('cta')}
            </Link>
          </div> */}
          <div className="mt-2 cursor-pointer block lg:hidden">
            <MobileDrawer />
          </div>
        </div>
      </div>
      <hr className="w-full" />
    </header>
  );
}
