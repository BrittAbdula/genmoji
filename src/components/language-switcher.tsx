'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { GlobeIcon } from 'lucide-react';

const localeNames = {
  en: 'English',
  ja: '日本語',
  fr: 'Français',
  zh: '中文',
} as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common.navigation');

  const switchLocale = (newLocale: keyof typeof localeNames) => {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length > 1) {
      router.replace('/', { locale: newLocale });
    } else {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <GlobeIcon className="h-5 w-5" />
          <span className="sr-only">{t('switchLanguage')}</span>
          <span className="absolute -bottom-1 -right-1 text-xs font-bold">
            {locale.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(localeNames).map(([key, name]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => switchLocale(key as keyof typeof localeNames)}
            className={locale === key ? 'bg-accent' : ''}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 