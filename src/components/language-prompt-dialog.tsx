'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';

const LANGUAGE_PROMPT_KEY = 'language-prompt-shown';

const LANGUAGE_NAMES = {
  en: 'English',
  ja: '日本語',
  fr: 'Français',
  zh: '中文',
} as const;

const getBrowserLanguage = () => {
  // 获取浏览器语言并匹配到支持的语言
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = ['en', 'ja', 'fr', 'zh'];
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

export function LanguagePromptDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('languagePrompt');
  
  useEffect(() => {
    // 检查是否已经显示过提示
    const hasShown = localStorage.getItem(LANGUAGE_PROMPT_KEY);
    if (hasShown) return;

    // 获取浏览器语言
    const browserLang = getBrowserLanguage();
    
    // 如果浏览器语言与当前语言不匹配，显示对话框
    if (browserLang !== currentLocale) {
      setIsOpen(true);
    }

    // 标记已显示过提示
    localStorage.setItem(LANGUAGE_PROMPT_KEY, 'true');
  }, [currentLocale]);

  const handleSwitch = () => {
    const browserLang = getBrowserLanguage();
    router.replace(pathname, { locale: browserLang });
    setIsOpen(false);
  };

  const handleStay = () => {
    setIsOpen(false);
  };

  const browserLang = getBrowserLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={handleStay}>
            {t('stayIn', { language: LANGUAGE_NAMES[currentLocale as keyof typeof LANGUAGE_NAMES] })}
          </Button>
          <Button onClick={handleSwitch}>
            {t('switchTo', { language: LANGUAGE_NAMES[browserLang as keyof typeof LANGUAGE_NAMES] })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 