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
}

const EmojiContainer = ({ 
  emoji, 
  size = 'md', 
  lazyLoad = true,
  priority = false,
  padding = 'p-0',
  withBorder = true
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

  return (
    <Link 
      href={`/emoji/${emoji.slug}/`}
      className={cn(
        "block relative",
        "rounded-md cursor-pointer flex items-center justify-center",
        "transition-colors duration-200",
        "hover:bg-gray-950/[.05] active:bg-gray-950/[.1]",
        "dark:hover:bg-gray-50/[.15] dark:active:bg-gray-50/[.2]",
        withBorder && "border-2 border-purple-700/30 rounded-lg",
        padding,
        sizeClasses[size]
      )}
    >
      <div className="w-full h-full flex items-center justify-center rounded-md">
        <Image 
          src={emoji.image_url.trim()} 
          alt={t('imageAlt', { prompt: emoji.prompt })}
          width={sizeValues[size]}
          height={sizeValues[size]}
          className="w-[95%] h-[95%] object-contain"
          loading={lazyLoad && !priority ? "lazy" : "eager"}
          priority={priority}
          draggable={false}
          sizes={`(max-width: 768px) ${sizeValues[size]}px, ${sizeValues[size]}px`}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      </div>
    </Link>
  );
};

export default EmojiContainer;