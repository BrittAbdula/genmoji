"use client";

import { Icons } from "@/components/icons";
import { MobileDrawer } from "@/components/mobile-drawer";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/config";
import { outfit } from '@/lib/fonts';
import { AuroraText } from "@/components/ui/aurora-text";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 p-0 bg-background/60 backdrop-blur">
      <div className="flex justify-between items-center container mx-auto p-2">
        <Link
          href="/"
          title="brand-logo"
          className="relative mr-6 flex items-center space-x-2"
        >
          <img src="/logo.png" alt="genmoji logo" width="40" height="40"/>
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
            <AuroraText>Genmoji</AuroraText>{" "}
            <span className="text-muted-foreground">Online</span>
          </p>
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle className="hidden sm:inline-flex" />
          <div className="hidden lg:block">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-8 text-white rounded-full group"
              )}
            >
              {siteConfig.cta}
            </Link>
          </div>
          <div className="mt-2 cursor-pointer block lg:hidden">
            <MobileDrawer />
          </div>
        </div>
      </div>
      <hr className="w-full" />
    </header>
  );
}
