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
import { CategoryNavigation } from "@/components/category-navigation";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { Wand2 } from "lucide-react";
import React from "react";

// 用于样式列表项的自定义组件
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

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
            
            {/* 生成器二级菜单 */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    isActive('/emoji-maker') || isActive('/sticker-maker') || isActive('/mascot-maker') 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}>
                    Generators
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/"
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/10 to-primary/30 p-6 no-underline outline-none focus:shadow-md"
                          >
                            <Wand2 className="h-6 w-6 mb-2" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              AI Generators
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Create custom emojis, stickers, and mascots with our AI-powered tools
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem
                        title="Emoji Maker"
                        href="/genmoji-maker"
                      >
                        Create custom emojis for your messages and social media
                      </ListItem>
                      <ListItem
                        title="Sticker Maker"
                        href="/sticker-maker"
                      >
                        Design vibrant stickers that make your messages pop
                      </ListItem>
                      <ListItem
                        title="Mascot Maker"
                        href="/mascot-maker"
                      >
                        Build distinctive mascots for your brand or project
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="hidden lg:flex">
              <CategoryNavigation />
            </div>
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
