"use client";

import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  Download,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { getSubscriptionStatus, cancelSubscription } from '@/lib/api';
import { useRouter } from '@/i18n/routing';
import Link from 'next/link';

export const runtime = 'edge';

export default function SubscriptionPage() {
  const t = useTranslations('subscription');
  const tm = useTranslations('subscription.management');
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      router.push('/');
      return;
    }

    loadSubscriptionData();
  }, [user, token]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSubscriptionStatus(token!);
      if (response.success) {
        setSubscriptionData(response.data);
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError(tm('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm(tm('confirmCancel'))) {
      return;
    }

    try {
      setCancelling(true);
      const response = await cancelSubscription(token!);
      if (response.success) {
        // Reload subscription data to reflect the cancellation
        await loadSubscriptionData();
      } else {
        setError(response.error || tm('cancelError'));
      }
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError(tm('cancelError'));
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Assuming amount is in cents
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-orange-100 text-orange-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{tm('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  const isPremium = subscriptionData?.subscription?.status === 'active';
  const subscription = subscriptionData?.subscription;
  const usage = subscriptionData?.usage;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
                      <Link 
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {tm('backToHome')}
            </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tm('title')}</h1>
              <p className="text-muted-foreground">{tm('subtitle')}</p>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span>{tm('error')}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {tm('currentPlan')}
              </CardTitle>
              <CardDescription>
                {tm('currentPlanDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPremium ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{subscription?.plan_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subscription?.billing_cycle === 'yearly' ? tm('yearlyBilling') : tm('monthlyBilling')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(subscription?.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(subscription?.status)}
                        {subscription?.status}
                      </div>
                    </Badge>
                  </div>

                                     <div className="h-px bg-border" />

                   <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{tm('amount')}:</span>
                      <span className="font-medium">
                        {formatCurrency(subscription?.amount, subscription?.currency)}
                        /{subscription?.billing_cycle === 'yearly' ? tm('perYear') : tm('perMonth')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{tm('nextBilling')}:</span>
                      <span className="font-medium">
                        {formatDate(subscription?.current_period_end)}
                      </span>
                    </div>
                    {/* Daily limit row removed due to monthly credits migration */}
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{tm('planFeatures')}:</h4>
                    <div className="space-y-1">
                      {subscription?.plan_features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold mb-2">{tm('freePlan')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tm('freePlanDescription')}
                  </p>
                  <Button asChild>
                    <Link href="/genmoji-maker">
                      {tm('upgradeToPremium')}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {usage?.type === 'monthly' ? t('monthlyCredits') : tm('dailyUsage')}
              </CardTitle>
              <CardDescription>
                {usage?.type === 'monthly' ? t('monthlyCreditsDescription') : tm('dailyUsageDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {usage ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{usage.type === 'monthly' ? tm('usedThisMonth') : tm('usedToday')}:</span>
                      <span className="font-medium">
                        {usage.current} / {usage.limit}
                      </span>
                    </div>
                    <Progress 
                      value={(usage.current / usage.limit) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{usage.type === 'monthly' ? tm('resetsAt') : tm('resetsIn')}:</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {new Date(usage.resetTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(usage.resetTime)}
                    </p>
                  </div>

                  {isPremium && (
                    <>
                      <div className="h-px bg-border" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{tm('premiumBenefits')}:</h4>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span>{tm('unlimitedGenerations')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-3 h-3 text-blue-500" />
                            <span>{tm('prioritySupport')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Download className="w-3 h-3 text-green-500" />
                            <span>{tm('commercialRights')}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tm('loading')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {isPremium && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{tm('subscriptionActions')}</CardTitle>
              <CardDescription>
                {tm('subscriptionActionsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-orange-900 mb-1">
                        {tm('cancelSubscription')}
                      </h4>
                      <p className="text-sm text-orange-800 mb-3">
                        {tm('cancelDescription')}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        {cancelling ? tm('cancelling') : tm('cancelSubscription')}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-1">
                        {tm('billingInformation')}
                      </h4>
                      <p className="text-sm text-blue-800 mb-3">
                        {tm('billingDescription')}
                      </p>
                      <Button 
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        onClick={() => {
                          // This would typically open Stripe customer portal
                          alert('Stripe customer portal integration would go here');
                        }}
                      >
                        {tm('manageBilling')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
