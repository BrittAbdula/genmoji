import { Link } from '@/i18n/routing';
import { Emoji } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface EmojiContainerProps {
  emoji: Emoji;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lazyLoad?: boolean;
}

const EmojiContainer = ({ emoji, size = 'md', lazyLoad = true }: EmojiContainerProps) => {
  const t = useTranslations('emoji.container');

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-64 h-64',
    xl: 'w-full h-full max-w-[520px] max-h-[520px]'
  };

  // 获取尺寸的数值，用于 Next.js Image 组件
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
      )}
    >
      {lazyLoad ? (
        <Image 
          src={emoji.image_url} 
          alt={t('imageAlt', { prompt: emoji.prompt })}
          width={sizeValues[size]}
          height={sizeValues[size]}
          className="w-full h-full object-contain"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <img 
          src={emoji.image_url} 
          alt={t('imageAlt', { prompt: emoji.prompt })}
          className="w-full h-full object-contain"
          draggable={false}
        />
      )}
    </Link>
  );
};

export default EmojiContainer;