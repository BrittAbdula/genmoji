'use client';

import React from 'react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ReactGA from 'react-ga4';

const TRACKING_ID = 'G-6T495VYMD7'; // 您的 GA4 跟踪 ID

export function GoogleAnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    ReactGA.initialize(TRACKING_ID);
  }, []);

  useEffect(() => {
    const url = pathname + searchParams.toString();
    ReactGA.send({ hitType: "pageview", page: url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}