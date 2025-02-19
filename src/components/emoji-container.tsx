import { Link } from '@/i18n/routing';
import { Emoji } from '@/types/emoji';
import { useTranslations } from 'next-intl';
import {cn} from '@/lib/utils';

interface EmojiContainerProps {
  emoji: Emoji;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const EmojiContainer = ({ emoji, size = 'md' }: EmojiContainerProps) => {
  const t = useTranslations('emoji.container');

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-64 h-64',
    xl: 'w-full h-full max-w-[520px] max-h-[520px]'
  };

  return (
    <Link 
      href={`/emoji/${emoji.slug}/`}
      className={cn(
        "block relative transform-gpu transition-all duration-300",
        "rounded-xl cursor-pointer overflow-hidden",
        "hover:bg-gray-950/[.05] active:bg-gray-950/[.1]",
        "dark:hover:bg-gray-50/[.15] dark:active:bg-gray-50/[.2]",
        "hover:scale-105 hover:-translate-y-0.5",
        "p-2",
        sizeClasses[size]
      )}
    >
      <img 
          src={emoji.image_url} 
          alt={t('imageAlt', { prompt: emoji.prompt })}
          className={`aspect-square w-full  transition-opacity duration-200 ease-out`}
        />
    </Link>
  );
};

export default EmojiContainer;