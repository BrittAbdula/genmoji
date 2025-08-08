"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LogOut, User, Heart, CreditCard, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { getSubscriptionStatus } from "@/lib/api";
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

export function UserMenu() {
  const t = useTranslations('auth');
  const { user, logout, token } = useAuthStore();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch subscription status when user is logged in
  useEffect(() => {
    if (user && token) {
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
        .finally(() => {
          setIsLoadingSubscription(false);
        });
    }
  }, [user, token]);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isPremium = subscriptionStatus?.subscription?.status === 'active';

  // 处理升级到高级版的点击事件
  const handleUpgradeClick = (e: React.MouseEvent) => {
    if (!isPremium) {
      e.preventDefault();
      e.stopPropagation();
      setDropdownOpen(false); // 关闭下拉菜单
      setShowSubscriptionDialog(true);
    }
  };

  // 处理弹窗状态变化
  const handleDialogOpenChange = (open: boolean) => {
    setShowSubscriptionDialog(open);
    // 如果弹窗关闭，确保下拉菜单也关闭
    if (!open) {
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            {/* Premium badge */}
            {isPremium && (
              <div className="absolute -top-1 -right-1">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-0.5">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                {isPremium && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                    <Crown className="h-2.5 w-2.5 mr-1" />
                    {t('premium')}
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-none text-muted-foreground">
                {/* {user.email} */}
              </p>
                  {subscriptionStatus && (
                <div className="text-xs text-muted-foreground">
                  {subscriptionStatus.usage.type === 'monthly' ? (
                    <span className="text-green-600">
                      {subscriptionStatus.subscription?.plan_name} • {subscriptionStatus.usage.current}/{subscriptionStatus.usage.limit} {t('credits_this_month')}
                    </span>
                  ) : (
                    <span className="text-orange-600">
                      {t('free_plan')} • {subscriptionStatus.usage.current}/{subscriptionStatus.usage.limit} {t('generations_today')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/my-emojis" className="flex items-center">
              <Heart className="mr-2 h-4 w-4" />
              {t('my_emojis')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            {isPremium ? (
              <Link href="/subscription" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                {t('manage_subscription')}
              </Link>
            ) : (
              <button 
                onClick={handleUpgradeClick}
                className="flex items-center w-full px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t('upgrade_to_premium')}
              </button>
            )}
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {t('profile')}
            </Link>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </>
  );
} 