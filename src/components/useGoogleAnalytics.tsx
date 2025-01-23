'use client';

import React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { usePathname, useSearchParams } from 'next/navigation';

const TRACKING_ID = 'G-6T495VYMD7'; // 您的 GA4 跟踪 ID

const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.initialize(TRACKING_ID);
  }, []);

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);
};

export const useTrackEvents = () => {
  const trackEvent = (category: string, action: string, label?: string) => {
    ReactGA.event({
      category,
      action,
      label,
    });
  };

  return {
    trackLeftEmojiClick: (emoji: string) => trackEvent('Emoji Selection', 'Left Emoji Click', emoji),
    trackLeftEmojiRandomize: () => trackEvent('Emoji Selection', 'Left Emoji Randomize'),
    trackRightEmojiClick: (emoji: string) => trackEvent('Emoji Selection', 'Right Emoji Click', emoji),
    trackRightEmojiRandomize: () => trackEvent('Emoji Selection', 'Right Emoji Randomize'),
    trackFullEmojiRandomize: () => trackEvent('Emoji Selection', 'Full Emoji Randomize'),
    trackImageCopy: (combination: string) => trackEvent('Image Action', 'Copy', combination),
    trackImageDownload: (combination: string) => trackEvent('Image Action', 'Download', combination),
  };
};

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