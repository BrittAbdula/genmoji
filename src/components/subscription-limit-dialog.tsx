"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuthStore } from "@/store/auth-store";
import { getSubscriptionPlans, createSubscription } from "@/lib/api";
import { CheckIcon, ShieldCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SubscriptionLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitInfo: {
    currentCount: number;
    limit: number;
    resetTime: string;
    type?: 'monthly' | 'daily';
  };
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price_monthly: number | null;
  price_yearly: number | null;
  features: string[];
  daily_generation_limit: number;
  is_active: boolean;
}

// 简化的定价参数
const PRO_PLAN = {
  monthPrice: "$5.99",
  yearlyPrice: "$3.83",
  yearlyOff: "36%",
};

export function SubscriptionLimitDialog({
  open,
  onOpenChange,
  limitInfo
}: SubscriptionLimitDialogProps) {
  const t = useTranslations('subscription');
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { token } = useAuthStore();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [creatingSubscription, setCreatingSubscription] = useState(false);

  // 计算重置时间的倒计时
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [hoursUntilReset, setHoursUntilReset] = useState(0);
  const [minutesUntilReset, setMinutesUntilReset] = useState(0);
  const [secondsUntilReset, setSecondsUntilReset] = useState(0);

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  useEffect(() => {
    const updateCountdown = () => {
      const resetTime = new Date(limitInfo.resetTime);
      const now = new Date();
      const timeDiff = resetTime.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        setHoursUntilReset(hours);
        setMinutesUntilReset(minutes);
        setSecondsUntilReset(seconds);
        setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setHoursUntilReset(0);
        setMinutesUntilReset(0);
        setSecondsUntilReset(0);
        setTimeUntilReset('0h 0m 0s');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // 每秒更新一次

    return () => clearInterval(interval);
  }, [limitInfo.resetTime]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionPlans();
      if (response.success) {
        setPlans(response.plans.filter(plan => plan.is_active));
        // Initialize selected plan based on current billing cycle
        const yearlyPlan = response.plans.find(plan => (plan.price_yearly ?? 0) > 0);
        const monthlyPlan = response.plans.find(plan => (plan.price_monthly ?? 0) > 0);
        const initialPlan = billingCycle === 'yearly' ? yearlyPlan : monthlyPlan;
        if (initialPlan) setSelectedPlan(initialPlan.id);
      }
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep selected plan in sync with billing cycle and available plans
  useEffect(() => {
    if (!plans.length) return;
    const yearlyPlan = plans.find(plan => (plan.price_yearly ?? 0) > 0);
    const monthlyPlan = plans.find(plan => (plan.price_monthly ?? 0) > 0);
    const nextPlan = billingCycle === 'yearly' ? yearlyPlan : monthlyPlan;
    if (nextPlan && selectedPlan !== nextPlan.id) {
      setSelectedPlan(nextPlan.id);
    }
  }, [billingCycle, plans]);

  const handleSubscribe = async () => {
    if (!selectedPlan || !token) return;

    try {
      setCreatingSubscription(true);
      const response = await createSubscription(selectedPlan, billingCycle, token);
      
      if (response.success && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
    } finally {
      setCreatingSubscription(false);
    }
  };

  const handleWaitForReset = () => {
    onOpenChange(false);
  };

  // 优化的移动端内容
  const mobileContent = (
    <div className="space-y-3">
      {/* 主标题 */}
      <div className="text-center">
        <h2 className="text-xl font-bold mb-1 text-foreground">
          {t('limitDialog.upgradeHeroTitle')}
        </h2>
        <p className="text-xs text-muted-foreground">{t('limitDialog.upgradeHeroSubtitle')}</p>
      </div>

      {/* 定价选项卡片 */}
      <div className="space-y-3">
        <div className="rounded-lg border p-3 bg-muted/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="pr-2">
              <div className="font-semibold text-foreground">{t('management.freePlan')}</div>
              <ul className="mt-1 space-y-1 list-disc list-inside text-muted-foreground">
                <li>
                  {limitInfo.type === 'monthly'
                    ? t('limitDialog.creditsPerMonth', { count: limitInfo.limit })
                    : t('limitDialog.generationsPerDay', { count: limitInfo.limit })}
                </li>
                <li>{t('limitDialog.standardSpeed')}</li>
                <li>{t('limitDialog.personalUse')}</li>
              </ul>
            </div>
            <div className="pl-0 sm:pl-2 sm:border-l">
              <div className="font-semibold text-primary">{t('proPlan')}</div>
              <ul className="mt-1 space-y-1 list-disc list-inside text-foreground">
                <li>{t('limitDialog.creditsPerMonth', { count: 1000 })}</li>
                <li>{t('limitDialog.prioritySpeed')}</li>
                <li>{t('features.commercialUse')}</li>
                <li>{t('features.advancedModels')}</li>
                <li>{t('features.highQuality')}</li>
                <li>{t('features.prioritySupport')}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center text-[11px] text-primary font-medium -mb-1">{t('saveWithYearly', { off: PRO_PLAN.yearlyOff })}</div>
        <div className="flex gap-3 items-stretch">
          {/* 年度计划 */}
          <div
            className={cn(
              "flex-1 p-3 border-2 rounded-xl cursor-pointer transition-all relative flex flex-col hover:shadow-sm",
              billingCycle === 'yearly'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/70"
            )}
            onClick={() => setBillingCycle('yearly')}
          >
            {billingCycle === 'yearly' && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            )}
            <div className="absolute top-2 left-2 space-y-1">
              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {PRO_PLAN.yearlyOff} OFF
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {t('bestValue')}
              </Badge>
            </div>
            <div className="mt-5 flex-1">
              <h3 className="font-semibold text-sm text-foreground">{t('yearly')}</h3>
              <div className="mt-1">
                <span className="text-lg font-bold text-foreground">{PRO_PLAN.yearlyPrice}</span>
                <span className="text-muted-foreground ml-1 text-xs">{t('usdPerMonth')}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t('billedYearly')}</div>
            </div>
          </div>

          {/* 月度计划 */}
          <div
            className={cn(
              "flex-1 p-3 border-2 rounded-xl cursor-pointer transition-all relative flex flex-col hover:shadow-sm",
              billingCycle === 'monthly'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/70"
            )}
            onClick={() => setBillingCycle('monthly')}
          >
            {billingCycle === 'monthly' && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            )}
            <div className="mt-5 flex-1">
              <h3 className="font-semibold text-sm text-foreground">{t('monthly')}</h3>
              <div className="mt-1">
                <span className="text-lg font-bold text-foreground">{PRO_PLAN.monthPrice}</span>
                <span className="text-muted-foreground ml-1 text-xs">{t('usdPerMonth')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2 pt-1">
        <Button
          onClick={handleSubscribe}
          disabled={creatingSubscription}
          className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
        >
          {creatingSubscription ? t('processing') : t('upgradeToPro')}
        </Button>
        <div className="text-[11px] text-muted-foreground text-center leading-tight">
          <div className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{t('secureCheckoutShort')}</span>
          </div>
          <div className="mt-0.5">{t('paymentMethods')}</div>
          <div className="mt-1 text-[10px]">{t('footer.securePayment')}</div>
          <div className="text-[10px]">{t('footer.guarantee')}</div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleWaitForReset}
          className="w-full py-3"
        >
          {t('limitDialog.freeComeBackIn', { time: timeUntilReset })}
        </Button>
      </div>
    </div>
  );

  // 优化的桌面端内容
  const desktopContent = (
    <div className="space-y-5">
      {/* 限制状态提示 */}
      <div className="text-center space-y-2">
        <div className="w-10 h-10 mx-auto flex items-center justify-center">
          <img src="/logo.png" alt="Genmoji Online logo" className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{limitInfo.type === 'monthly' ? t('limitDialog.monthlyCreditsUsed') : t('limitDialog.dailyLimitReached')}</h3>
        <p className="text-sm text-muted-foreground">
          {limitInfo.type === 'monthly'
            ? t('limitDialog.monthlyUsage', { current: limitInfo.currentCount, limit: limitInfo.limit })
            : t('limitDialog.dailyUsage', { current: limitInfo.currentCount, limit: limitInfo.limit })}
        </p>
      </div>

      {/* 主标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1 text-foreground">
          {t('limitDialog.upgradeHeroTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('limitDialog.upgradeHeroSubtitle')}</p>
      </div>

      {/* 功能特性列表移除：信息已整合至 Free vs Pro 对比块 */}

      {/* 定价选项 */}
      <div className="space-y-3">
        <div className="rounded-xl border p-4 bg-muted/30">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="pr-4">
              <div className="font-semibold text-foreground">{t('management.freePlan')}</div>
              <ul className="mt-1 space-y-1 list-disc list-inside text-muted-foreground">
                <li>
                  {limitInfo.type === 'monthly'
                    ? t('limitDialog.creditsPerMonth', { count: limitInfo.limit })
                    : t('limitDialog.generationsPerDay', { count: limitInfo.limit })}
                </li>
                <li>{t('limitDialog.standardSpeed')}</li>
                <li>{t('limitDialog.personalUse')}</li>
              </ul>
            </div>
            <div className="pl-4 border-l">
              <div className="font-semibold text-primary">{t('proPlan')}</div>
              <ul className="mt-1 space-y-1 list-disc list-inside text-foreground">
                <li>{t('limitDialog.creditsPerMonth', { count: 1000 })}</li>
                <li>{t('limitDialog.prioritySpeed')}</li>
                <li>{t('features.commercialUse')}</li>
                <li>{t('features.advancedModels')}</li>
                <li>{t('features.highQuality')}</li>
                <li>{t('features.prioritySupport')}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-primary font-medium -mb-1">{t('saveWithYearly', { off: PRO_PLAN.yearlyOff })}</div>
        <div className="flex gap-3 items-stretch">
          {/* 年度计划 */}
          <div
            className={cn(
              "flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all relative flex flex-col hover:shadow-sm",
              billingCycle === 'yearly'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/70"
            )}
            onClick={() => setBillingCycle('yearly')}
          >
            {billingCycle === 'yearly' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
            <div className="absolute top-2 left-2 space-y-1">
              <Badge variant="secondary" className="text-xs">
                {PRO_PLAN.yearlyOff} OFF
              </Badge>
              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                {t('bestValue')}
              </Badge>
            </div>
            <div className="mt-6 flex-1">
              <h3 className="font-semibold text-foreground">{t('yearly')}</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-foreground">{PRO_PLAN.yearlyPrice}</span>
                <span className="text-muted-foreground ml-1">{t('usdPerMonth')}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t('billedYearly')}</div>
            </div>
          </div>

          {/* 月度计划 */}
          <div
            className={cn(
              "flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all relative flex flex-col hover:shadow-sm",
              billingCycle === 'monthly'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-border/70"
            )}
            onClick={() => setBillingCycle('monthly')}
          >
            {billingCycle === 'monthly' && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
            <div className="mt-6 flex-1">
              <h3 className="font-semibold text-foreground">{t('monthly')}</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-foreground">{PRO_PLAN.monthPrice}</span>
                <span className="text-muted-foreground ml-1">{t('usdPerMonth')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <Button
          onClick={handleSubscribe}
          disabled={creatingSubscription}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
        >
          {creatingSubscription ? t('processing') : t('upgradeToPro')}
        </Button>
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('secureCheckoutShort')} • {t('paymentMethods')}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">{t('footer.securePayment')}</div>
          <div className="text-[11px] text-muted-foreground">{t('footer.guarantee')}</div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleWaitForReset}
          className="w-full"
        >
          {t('limitDialog.comeBackIn', { time: timeUntilReset })}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-background h-[85dvh] overflow-hidden flex flex-col border-t border-border/60 rounded-t-2xl">
          <DrawerHeader className="px-4 pb-0 sticky top-0 bg-background z-10">
            <DrawerTitle className="sr-only">{t('title')}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-2 pb-4 overflow-y-auto flex-1">
            {mobileContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">{t('title')}</DialogTitle>
        </DialogHeader>
        {desktopContent}
      </DialogContent>
    </Dialog>
  );
}
