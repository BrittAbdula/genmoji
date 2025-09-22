import { Link } from '@/i18n/routing';
import { Emoji } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

  // Badges removed per new gallery style

  const altText = t('imageAlt', { prompt: emoji.prompt });

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
      // 浅色模式：极浅深色底 + 内描边，避免白色元素“隐身”
      'bg-black/5',
      '[box-shadow:inset_0_0_0_1px_rgba(0,0,0,0.06)]',
      // 深色模式：极浅浅色底 + 内描边，避免黑色元素“隐身”
      'dark:bg-white/5',
      'dark:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)]'
    )}>
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
    </div>
  </Link>
  );
};

export default EmojiContainer;
