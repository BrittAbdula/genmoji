import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Subscription Cancelled - Genmoji Online',
  description: 'Your subscription process was cancelled. You can still enjoy our free features.',
};

export default function SubscriptionCancelPage() {
  const t = useTranslations('subscription');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Card className="p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Cancel Icon */}
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-orange-600" />
              </div>

              {/* Cancel Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Subscription Cancelled
                </h1>
                <p className="text-muted-foreground">
                  No worries! You can still enjoy our free features and upgrade anytime.
                </p>
              </div>

              {/* Free Features */}
              <div className="space-y-3 text-left w-full">
                <h3 className="font-semibold text-sm">Free Features Available:</h3>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm">3 daily generations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Basic emoji generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Access to gallery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Community features</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 w-full">
                <Button asChild className="w-full">
                  <Link href="/genmoji-maker">
                    Try Free Generation
                  </Link>
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>You can upgrade to premium anytime from your account.</p>
                <p>Questions? Contact our support team.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
