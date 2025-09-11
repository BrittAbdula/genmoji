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
import { cn } from "@/lib/utils";
import { Link, usePathname } from '@/i18n/routing';
import { IoMenuSharp } from "react-icons/io5";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "@/components/language-switcher";
import React, { useState, useEffect } from 'react';
import { AuroraText } from "@/components/ui/aurora-text";
import { ChevronRight, Wand2, User, Heart, Crown, CreditCard } from "lucide-react";
import { getSubscriptionStatus } from "@/lib/api";
import { LoginDialog } from "@/components/login-dialog";
import { useAuthStore } from "@/store/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscriptionLimitDialog } from "@/components/subscription-limit-dialog";

interface SubscriptionStatus {
  subscription: {
    id: number;
    plan_name: string;
    status: 'active' | 'cancelled' | 'expired' | 'pending';
    billing_cycle: 'monthly' | 'yearly';
    amount: number;
    currency: string;
    daily_generation_limit: number;
    current_period_start: string;
    current_period_end: string;
    plan_features: string[];
  } | null;
  usage: {
    type: 'monthly' | 'daily';
    current: number;
    limit: number;
    resetTime: string;
  };
}

export function MobileDrawer() {
  const pathname = usePathname();
  const t = useTranslations('common');
  const nav = useTranslations('common.navigation');
  const authT = useTranslations('auth');
  const { isLoggedIn, user, logout, checkAuth, token } = useAuthStore();
  const isActive = (path: string) => pathname === path;
  const [open, setOpen] = useState(false);

  // 添加子菜单状态
  const [generatorsOpen, setGeneratorsOpen] = useState(false);

  // 订阅状态
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  // 初始化认证
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 获取订阅状态
  useEffect(() => {
    if (isLoggedIn && token) {
      setIsLoadingSubscription(true);
      getSubscriptionStatus(token)
        .then((response) => {
          if (response.success) {
            setSubscriptionStatus(response.data);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch subscription status:', error);
        })
        .finally(() => setIsLoadingSubscription(false));
    } else {
      setSubscriptionStatus(null);
    }
  }, [isLoggedIn, token]);



  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  // 获取用户名首字母
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isPremium = subscriptionStatus?.subscription?.status === 'active';
  const handleUpgradeClick = () => {
    if (!isPremium) {
      setShowSubscriptionDialog(true);
    }
  };
  const handleDialogOpenChange = (dialogOpen: boolean) => {
    setShowSubscriptionDialog(dialogOpen);
    if (!dialogOpen) {
      // 保持抽屉状态不变
    }
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
          
          {/* 生成器子菜单 */}
          <div className="border-t pt-2 mt-2">
            <button 
              onClick={() => setGeneratorsOpen(!generatorsOpen)}
              className="flex items-center justify-between w-full text-sm font-medium transition-colors hover:text-foreground px-2 py-1.5 rounded-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                <span>Generators</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${generatorsOpen ? 'rotate-90' : ''}`} />
            </button>
            {generatorsOpen && (
              <div className="ml-6 mt-2 pl-2 border-l space-y-2">
                <Link 
                  href="/genmoji-maker"
                  onClick={handleLinkClick}
                  className={cn(
                    "block text-sm hover:text-foreground py-1",
                    isActive('/genmoji-maker') ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  Genmoji Maker
                </Link>
                <Link 
                  href="/sticker-maker"
                  onClick={handleLinkClick}
                  className={cn(
                    "block text-sm hover:text-foreground py-1",
                    isActive('/sticker-maker') ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  Sticker Maker
                </Link>
                <Link 
                  href="/mascot-maker"
                  onClick={handleLinkClick}
                  className={cn(
                    "block text-sm hover:text-foreground py-1",
                    isActive('/mascot-maker') ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  Mascot Maker
                </Link>
              </div>
            )}
          </div>



        </div>

        <DrawerFooter className="px-6 space-y-3">
          {/* 用户认证区域 */}
          {isLoggedIn && user ? (
            <div className="space-y-3">
              {/* 用户信息 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} alt={user.name} />
                    <AvatarFallback className="text-sm">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {isPremium && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-0.5">
                      <Crown className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    {isPremium && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">Pro</Badge>
                    )}
                  </div>
                  {/* <p className="text-xs text-muted-foreground truncate">{user.email}</p> */}
                  {subscriptionStatus && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {subscriptionStatus.usage.type === 'monthly' ? (
                        <span className="text-green-600">
                          {subscriptionStatus.subscription?.plan_name} • {subscriptionStatus.usage.current}/{subscriptionStatus.usage.limit} credits
                        </span>
                      ) : (
                        <span className="text-orange-600">
                          {authT('free_plan')} • {subscriptionStatus.usage.current}/{subscriptionStatus.usage.limit} {authT('generations_today')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 用户功能链接 */}
              <div className="space-y-1">
                <Link
                  href="/my-emojis"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  {authT('my_emojis')}
                </Link>
                {isPremium ? (
                  <Link
                    href="/subscription"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    {authT('manage_subscription')}
                  </Link>
                ) : (
                  <button
                    onClick={handleUpgradeClick}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    {authT('upgrade_to_premium')}
                  </button>
                )}
                {/* <Link
                  href="/profile"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  {authT('profile')}
                </Link> */}
              </div>
              
              {/* 登出按钮 */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                {authT('logout')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <LoginDialog>
                <Button variant="outline" className="w-full">
                  {authT('login')}
                </Button>
              </LoginDialog>
            </div>
          )}
          
          {/* CTA 按钮 */}
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

          {/* 订阅弹窗 */}
          {subscriptionStatus && (
            <SubscriptionLimitDialog
              open={showSubscriptionDialog}
              onOpenChange={handleDialogOpenChange}
              limitInfo={{
                currentCount: subscriptionStatus.usage.current,
                limit: subscriptionStatus.usage.limit,
                resetTime: subscriptionStatus.usage.resetTime,
                type: subscriptionStatus.usage.type
              }}
            />
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
