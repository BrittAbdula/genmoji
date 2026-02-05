import { Link } from '@/i18n/routing';
import { Emoji } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Loader2, AlertCircle, Clock } from 'lucide-react';

interface EmojiContainerProps {
  emoji: Emoji;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lazyLoad?: boolean;
  priority?: boolean;
  padding?: string;
  withBorder?: boolean;
  showModelBadge?: boolean;
}

const EmojiContainer = ({ 
  emoji, 
  size = 'md', 
  lazyLoad = true,
  priority = false,
  padding = 'p-0',
  withBorder = true,
  showModelBadge = false
}: EmojiContainerProps) => {
  const t = useTranslations('emoji.container');

  // 调整尺寸保持正方形
  const sizeClasses = {
    sm: 'w-full h-full aspect-square',  // 完全正方形
    md: 'w-36 h-36',  
    lg: 'w-72 h-72',  
    xl: 'w-full h-full max-w-[600px] max-h-[600px]' 
  };

  // 调整尺寸为正方形
  const sizeValues = {
    sm: 100, // 宽高必须相同
    md: 144, 
    lg: 288, 
    xl: 600  
  };

  // Responsive sizes hint for better loading behavior
  const sizesMap = {
    sm: '(min-width:1280px) 10vw, (min-width:1024px) 12.5vw, (min-width:768px) 16.6vw, (min-width:640px) 25vw, 33vw',
    md: `${sizeValues.md}px`,
    lg: `${sizeValues.lg}px`,
    xl: `${sizeValues.xl}px`
  } as const;

  const altText = t('imageAlt', { prompt: emoji.prompt });

  // Check if emoji is in a pending/processing state
  const isPending = emoji.status === 'pending' || emoji.status === 'processing';
  const isFailed = emoji.status === 'failed';
  const hasImage = emoji.image_url && emoji.image_url.trim() !== '';

  // Pending/Processing state - show elegant loading UI
  if (isPending) {
    return (
      <div 
        className={cn(
          'group block relative outline-none',
          'cursor-default flex items-center justify-center',
          'transition-colors duration-200',
          withBorder ? 'border border-border/60' : 'border-0',
          padding,
          sizeClasses[size]
        )}
        title={emoji.prompt}
      >
        <div className={cn(
          'w-full h-full flex flex-col items-center justify-center gap-2',
          'bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5',
          'dark:from-primary/10 dark:via-primary/15 dark:to-primary/10',
          'animate-pulse'
        )}>
          {/* Animated loader */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="relative bg-background/80 backdrop-blur-sm rounded-full p-3">
              {emoji.status === 'processing' ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : (
                <Clock className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </div>
          {/* Status text - use i18n */}
          <span className="text-xs text-muted-foreground font-medium px-2 text-center">
            {emoji.status === 'processing' ? t('processing') : t('queued')}
          </span>
        </div>
      </div>
    );
  }

  // Failed state - show error UI with retry hint
  if (isFailed) {
    return (
      <div 
        className={cn(
          'group block relative outline-none',
          'cursor-pointer flex items-center justify-center',
          'transition-colors duration-200',
          withBorder ? 'border border-destructive/30' : 'border-0',
          'hover:border-destructive/50',
          padding,
          sizeClasses[size]
        )}
        title={emoji.error_message || t('failed')}
      >
        <div className={cn(
          'w-full h-full flex flex-col items-center justify-center gap-2',
          'bg-destructive/5',
          'dark:bg-destructive/10'
        )}>
          <div className="bg-destructive/10 rounded-full p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <span className="text-xs text-destructive font-medium px-2 text-center">
            {t('failed')}
          </span>
          {emoji.error_message && (
            <span className="text-[10px] text-muted-foreground px-3 text-center line-clamp-2">
              {emoji.error_message}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Normal completed state - show image
  return (
    <Link 
    href={`/emoji/${emoji.slug}/`}
    aria-label={altText}
    title={altText}
    className={cn(
      'group block relative outline-none',
      'cursor-pointer flex items-center justify-center',
      'transition-colors duration-200',
      // No tile background per updated style
      withBorder ? 'border border-border/60' : 'border-0',
      'focus-visible:ring-2 focus-visible:ring-primary/40',
      padding,
      sizeClasses[size]
    )}
  >
    {/* remove badges per new gallery style */}
    {/* optional vignette removed for fully flat tiles */}
    <div className={cn(
      'w-full h-full flex items-center justify-center',
      // 浅色模式：极浅深色底 + 内描边，避免白色元素"隐身"
      'bg-black/5',
      '[box-shadow:inset_0_0_0_1px_rgba(0,0,0,0.06)]',
      // 深色模式：极浅浅色底 + 内描边，避免黑色元素"隐身"
      'dark:bg-white/5',
      'dark:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)]'
    )}>
      {hasImage ? (
        <Image 
          src={emoji.image_url.trim()} 
          alt={altText}
          width={sizeValues[size]}
          height={sizeValues[size]}
          className={cn(
            'w-full h-full object-contain',
            // 浅色模式：微弱深色投影，增强白线条/淡色图形对比
            'drop-shadow-[0_0_0.75px_rgba(0,0,0,0.6)]',
            // 深色模式：微弱浅色投影，增强黑线条对比
            'dark:drop-shadow-[0_0_0.75px_rgba(255,255,255,0.7)]'
          )}
          loading={priority ? 'eager' : (lazyLoad ? 'lazy' : 'eager')}
          priority={priority}
          draggable={false}
          sizes={sizesMap[size]}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      ) : (
        // Fallback for empty image_url (shouldn't happen but safe)
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      )}
    </div>
  </Link>
  );
};

export default EmojiContainer;
