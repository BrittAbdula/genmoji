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
import { cn } from '@/lib/utils';

const localeNames = {
  en: 'English',
  ja: '日本語',
  fr: 'Français',
  zh: '中文',
} as const;

interface LanguageSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function LanguageSwitcher({ className, ...props }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common.navigation');

  const switchLocale = (newLocale: keyof typeof localeNames) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className={cn(className)}>
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
    </div>
  );
} 