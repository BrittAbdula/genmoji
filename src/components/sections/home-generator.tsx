"use client";

import { UnifiedGenmojiGenerator } from '@/components/unified-genmoji-generator';
import { useTranslations } from 'next-intl';

export function HomeGenerator() {
  const t = useTranslations('generator');

  return (
      <div id="home-generator" className="relative w-full max-w-2xl mx-auto">
          <UnifiedGenmojiGenerator />
      </div>
  );
} 