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
}

const EmojiContainer = ({ 
  emoji, 
  size = 'md', 
  lazyLoad = true,
  priority = false 
}: EmojiContainerProps) => {
  const t = useTranslations('emoji.container');

  // Define size classes for container
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-64 h-64',
    xl: 'w-full h-full max-w-[520px] max-h-[520px]'
  };

  // Dimensions in pixels for Next.js Image
  const sizeValues = {
    sm: 96, // 24 * 4
    md: 128, // 32 * 4
    lg: 256, // 64 * 4
    xl: 520
  };

  return (
    <Link 
      href={`/emoji/${emoji.slug}/`}
      className={cn(
        "block relative",
        "rounded-xl cursor-pointer flex items-center justify-center",
        "transition-colors duration-200",
        "hover:bg-gray-950/[.05] active:bg-gray-950/[.1]",
        "dark:hover:bg-gray-50/[.15] dark:active:bg-gray-50/[.2]",
        "p-2",
        sizeClasses[size] // Apply size class directly
      )}
    >
      <div className="w-full h-full relative">
        <Image 
          src={emoji.image_url} 
          alt={t('imageAlt', { prompt: emoji.prompt })}
          width={sizeValues[size]}
          height={sizeValues[size]}
          className="object-contain"
          loading={lazyLoad && !priority ? "lazy" : "eager"}
          priority={priority}
          draggable={false}
          sizes={`(max-width: 768px) ${sizeValues[size]}px, ${sizeValues[size]}px`}
          placeholder="empty"
        />
      </div>
    </Link>
  );
};

export default EmojiContainer;