import Link from 'next/link';
import { Emoji } from '@/types/emoji';

interface EmojiContainerProps {
  emoji: Emoji;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const EmojiContainer = ({ emoji, size = 'md' }: EmojiContainerProps) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-full h-full max-w-[400px] max-h-[400px]'
  };

  return (
    <Link 
      href={`/emoji/${emoji.slug}`}
      className="block group"
    >
      <div className="aspect-square rounded-2xl p-4 flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors">
        <img 
          src={emoji.image_url} 
          alt={emoji.prompt}
          className={`object-contain transition-transform group-hover:scale-105 ${sizeClasses[size]}`}
        />
      </div>
      {/* <p className="mt-2 text-sm text-center text-muted-foreground truncate">
        {emoji.prompt}
      </p> */}
    </Link>
  );
};

export default EmojiContainer;