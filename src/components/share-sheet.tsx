"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Emoji } from "@/types/emoji";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  SiWhatsapp,
  SiTelegram,
  SiDiscord,
  SiSignal,
  SiX,
  SiReddit,
  SiPinterest,
  SiFacebook,
  SiMessenger,
} from "react-icons/si";
import { CopyIcon, LinkIcon, MailIcon, CheckIcon } from "lucide-react";
import {
  shareEmojiNative,
  fetchEmojiFile,
  canShareFile,
  getPlatformShareUrl,
  copyImageToClipboard,
  copyTextToClipboard,
  trackShareIntent,
  detectPlatform,
  getShareUrl,
  type SharePlatform,
} from "@/lib/sharing";

type ChatPlatform = 'whatsapp' | 'telegram' | 'messenger' | 'signal' | 'discord';
type PostPlatform = 'x' | 'reddit' | 'pinterest' | 'facebook';

interface ShareSheetProps {
  emoji: Emoji;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHAT_TILES: { id: ChatPlatform; Icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'whatsapp', Icon: SiWhatsapp, color: 'text-[#25D366]' },
  { id: 'telegram', Icon: SiTelegram, color: 'text-[#26A5E4]' },
  { id: 'messenger', Icon: SiMessenger, color: 'text-[#0084FF]' },
  { id: 'signal', Icon: SiSignal, color: 'text-[#3A76F0]' },
  { id: 'discord', Icon: SiDiscord, color: 'text-[#5865F2]' },
];

const POST_TILES: { id: PostPlatform; Icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'x', Icon: SiX, color: 'text-foreground' },
  { id: 'reddit', Icon: SiReddit, color: 'text-[#FF4500]' },
  { id: 'pinterest', Icon: SiPinterest, color: 'text-[#E60023]' },
  { id: 'facebook', Icon: SiFacebook, color: 'text-[#1877F2]' },
];

export function ShareSheet({ emoji, open, onOpenChange }: ShareSheetProps) {
  const t = useTranslations('emoji.detail');
  const locale = useLocale();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [device, setDevice] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    if (open) setDevice(detectPlatform());
  }, [open]);

  useEffect(() => {
    if (!open) setFeedback(null);
  }, [open]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const text = t('sharing.defaultText', { prompt: emoji.prompt });

  const handleChatTile = async (platform: ChatPlatform) => {
    try {
      const file = await fetchEmojiFile(emoji.image_url, emoji.slug);
      if (canShareFile(file) && typeof navigator.share === 'function') {
        try {
          await navigator.share({ files: [file], title: emoji.prompt, text, url: getShareUrl() });
          trackShareIntent(emoji.slug, locale, platform);
          showFeedback(t('share.shared'));
          return;
        } catch (err: any) {
          if (err?.name !== 'AbortError') {
            console.error('share file failed:', err);
          } else {
            return;
          }
        }
      }
    } catch (err) {
      console.error('fetch file failed:', err);
    }

    if (platform === 'discord' || platform === 'signal') {
      const copied = await copyImageToClipboard(emoji.image_url);
      trackShareIntent(emoji.slug, locale, platform);
      showFeedback(copied ? t(`share.${platform}Tooltip`) : t('share.shareFailed'));
      return;
    }

    const url = getPlatformShareUrl(platform as any, getShareUrl(), text, emoji.image_url);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      trackShareIntent(emoji.slug, locale, platform);
    } else {
      showFeedback(t('share.shareFailed'));
    }
  };

  const handlePostTile = (platform: PostPlatform) => {
    const url = getPlatformShareUrl(platform, getShareUrl(), text, emoji.image_url);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      trackShareIntent(emoji.slug, locale, platform);
    }
  };

  const handleCopyImage = async () => {
    const ok = await copyImageToClipboard(emoji.image_url);
    trackShareIntent(emoji.slug, locale, 'copy-image');
    showFeedback(ok ? t('share.imageCopied') : t('alert.longPressToSave'));
  };

  const handleCopyLink = async () => {
    const ok = await copyTextToClipboard(getShareUrl());
    trackShareIntent(emoji.slug, locale, 'copy-link');
    showFeedback(ok ? t('share.linkCopied') : t('share.shareFailed'));
  };

  const handleEmail = () => {
    const url = getPlatformShareUrl('email', getShareUrl(), text);
    if (url) {
      window.location.href = url;
      trackShareIntent(emoji.slug, locale, 'email');
    }
  };

  const deviceHintKey =
    device === 'ios' ? 'share.iosHint' : device === 'android' ? 'share.androidHint' : 'share.desktopHint';

  const body = (
    <div className="px-4 pb-4 sm:px-6 sm:pb-6">
      <p className="text-xs text-muted-foreground mb-4">{t(deviceHintKey)}</p>

      {/* Send in chat */}
      <section className="mb-5">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
          {t('share.sendInChat')}
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {CHAT_TILES.map(({ id, Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleChatTile(id)}
              className="flex flex-col items-center gap-1.5 rounded-lg p-2 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Icon className={cn("h-7 w-7", color)} />
              <span className="text-[10px] sm:text-xs text-foreground capitalize">{t(`share.${id}`)}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Copy & paste */}
      <section className="mb-5">
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
          {t('share.copyAndPaste')}
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 hover:bg-muted transition-colors text-sm"
          >
            <CopyIcon className="h-4 w-4" />
            <span>{t('copyImage')}</span>
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 hover:bg-muted transition-colors text-sm"
          >
            <LinkIcon className="h-4 w-4" />
            <span>{t('copyLink')}</span>
          </button>
          <button
            type="button"
            onClick={handleEmail}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 hover:bg-muted transition-colors text-sm"
          >
            <MailIcon className="h-4 w-4" />
            <span>{t('share.email')}</span>
          </button>
        </div>
      </section>

      {/* Quick post */}
      <section>
        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
          {t('share.quickPost')}
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {POST_TILES.map(({ id, Icon, color }) => (
            <button
              key={id}
              type="button"
              onClick={() => handlePostTile(id)}
              className="flex flex-col items-center gap-1.5 rounded-lg p-2 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Icon className={cn("h-6 w-6", color)} />
              <span className="text-[10px] sm:text-xs text-foreground">{t(`share.${id}`)}</span>
            </button>
          ))}
        </div>
      </section>

      {feedback && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
          <CheckIcon className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-0">
          <DrawerHeader className="px-6 pb-2">
            <DrawerTitle>{t('share.title')}</DrawerTitle>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{t('share.title')}</DialogTitle>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
