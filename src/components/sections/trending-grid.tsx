import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { outfit } from '@/lib/fonts';
import { Emoji } from '@/types/emoji';

export async function TrendingGrid({ emojis }: { emojis: Emoji[] }) {
  const t = await getTranslations();
  if (!emojis || emojis.length === 0) return null;

  return (
    <section
      id="trending-grid"
      aria-labelledby="trending-grid-title"
      className="w-full max-w-[1400px] mx-auto px-2 mt-12 mb-2"
    >
      <div className="mb-4">
        <h2
          id="trending-grid-title"
          className={cn(
            'text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold tracking-tight gradient-text',
            outfit.className
          )}
        >
          {t('home.trendingGrid.title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('home.trendingGrid.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {emojis.map((e, idx) => (
          <Link
            key={e.slug}
            href={`/emoji/${e.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square w-full bg-muted/20">
              <Image
                src={e.image_url}
                alt={e.prompt}
                fill
                sizes="(min-width:1024px) 16vw, (min-width:640px) 25vw, 50vw"
                className="object-contain p-2"
                priority={idx < 6}
                loading={idx < 6 ? 'eager' : 'lazy'}
              />
              {(e.likes_count ?? 0) > 0 && (
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
                  <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
                  {e.likes_count}
                </span>
              )}
            </div>
            <div className="px-3 py-2 text-xs text-muted-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {e.prompt}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
