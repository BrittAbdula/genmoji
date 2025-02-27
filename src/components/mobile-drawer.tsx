import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Link, usePathname } from '@/i18n/routing';
import { IoMenuSharp } from "react-icons/io5";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "@/components/language-switcher";
import React from 'react';
import { AuroraText } from "@/components/ui/aurora-text";
export function MobileDrawer() {
  const pathname = usePathname();
  const t = useTranslations('common');
  const nav = useTranslations('common.navigation');
  const isActive = (path: string) => pathname === path;
  const [open, setOpen] = React.useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <IoMenuSharp className="text-2xl" />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="px-6">
          <DrawerTitle className="sr-only">{nav('menu')}</DrawerTitle>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={handleLinkClick}
              title={t('name')}
              className="relative flex items-center space-x-2"
            >
              <img src="/logo.png" alt={t('name')} width="40" height="40"/>
              <AuroraText>{t('name').split(' ')[0]}</AuroraText>{" "}
                <span className="text-muted-foreground">{t('name').split(' ')[1]}</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </DrawerHeader>

        <div className="px-6 py-4 flex flex-col gap-4">
          <Link 
            href="/" 
            onClick={handleLinkClick}
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground px-2 py-1.5 rounded-sm",
              isActive('/') ? "text-foreground bg-accent" : "text-muted-foreground"
            )}
          >
            {nav('home')}
          </Link>
          <Link 
            href="/gallery" 
            onClick={handleLinkClick}
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground px-2 py-1.5 rounded-sm",
              isActive('/gallery') ? "text-foreground bg-accent" : "text-muted-foreground"
            )}
          >
            {nav('gallery')}
          </Link>
        </div>

        <DrawerFooter className="px-6">
          <Link
            href="/"
            onClick={handleLinkClick}
            className={cn(
              buttonVariants({ variant: "default" }),
              "text-white rounded-full group w-full"
            )}
          >
            {t('cta')}
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
