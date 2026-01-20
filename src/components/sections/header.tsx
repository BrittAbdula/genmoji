"use client";

import { MobileDrawer } from "@/components/mobile-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { outfit } from '@/lib/fonts';
import { AuroraText } from "@/components/ui/aurora-text";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from 'next-intl';
import { LoginDialog } from "@/components/login-dialog";
import { UserMenu } from "@/components/user-menu";
import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
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
import { CATEGORY_LABELS } from '@/lib/categories';

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
  const t = useTranslations();
  const nav = useTranslations('common.navigation');
  const { isLoggedIn, checkAuth } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <header className="sticky top-0 z-50 p-0 bg-background/60 backdrop-blur">
      <div className="flex justify-between items-center container mx-auto p-2">
        <Link
          href="/"
          title={t('common.name')}
          className="relative flex items-center space-x-2"
        >
          <img src="/logo.png" alt={t('common.name')} width="40" height="40"/>
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
            <AuroraText>{t('common.name').split(' ')[0]}</AuroraText>{" "}
            <span className="text-muted-foreground">{t('common.name').split(' ')[1]}</span>
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

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent",
                    (isActive('/prompts') || pathname.startsWith('/prompts')) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {nav('prompts')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-popover text-popover-foreground">
                       <ListItem
                        key="all"
                        href="/prompts"
                        title={nav('allCategories')}
                      >
                         {nav('categoriesDescription')}
                      </ListItem>
                      {Object.entries(CATEGORY_LABELS).map(([key, info]) => {
                         if (key === 'all') return null;
                         return (
                          <ListItem
                            key={key}
                            href={`/prompts/${key}`}
                            title={`${info.emoji} ${info.label}`}
                          >
                           {nav('exploreCategory')} {info.label}
                          </ListItem>
                         )
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Styles 链接 */}
            <Link
              href="/styles"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname.startsWith('/styles') ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {nav('styles')}
            </Link>
          </nav>

          <LanguageSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          
          {/* 用户认证区域 */}
          <div className="hidden sm:flex">
            {isLoggedIn ? <UserMenu /> : <LoginDialog />}
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
