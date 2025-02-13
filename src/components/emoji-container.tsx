import { Link } from '@/i18n/routing';
import { Emoji } from '@/types/emoji';
import { useTranslations } from 'next-intl';

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
      href={`/emoji/${emoji.slug}`}
      className="block group"
    >
      <img 
          src={emoji.image_url} 
          alt={t('imageAlt', { prompt: emoji.prompt })}
          className={`aspect-square w-full p-1.5 transition-opacity duration-200 ease-out`}
        />
      {/* <p className="mt-2 text-sm text-center text-muted-foreground truncate">
        {emoji.prompt}
      </p> */}
    </Link>
  );
};

export default EmojiContainer;