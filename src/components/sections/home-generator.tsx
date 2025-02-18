"use client";

import { UnifiedGenmojiGenerator } from '@/components/unified-genmoji-generator';
import { useTranslations } from 'next-intl';
import { AuroraText } from '@/components/ui/aurora-text';

export function HomeGenerator() {
  const t = useTranslations('generator');

  return (
      <div className="relative w-full max-w-2xl mx-auto">
          <UnifiedGenmojiGenerator mode="inline" />
      </div>
  );
} 