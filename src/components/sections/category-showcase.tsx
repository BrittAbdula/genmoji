import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { outfit } from '@/lib/fonts';
import { getEmojis } from '@/lib/api';
import { filterSfw } from '@/lib/sfw-filter';
import { Emoji } from '@/types/emoji';

type CategoryInput = { name: string; translated_name: string; count?: number };

const CATEGORY_EMOJI: Record<string, string> = {
  smileys_emotion: '😊',
  people_body: '👨‍👩‍👧‍👦',
  animals_nature: '🐼',
  food_drink: '🍔',
  travel_places: '✈️',
  activities: '🎮',
  objects: '📱',
  symbols: '🔣',
  flags: '🏳️',
  other: '📁',
};

async function fetchPreview(category: string, locale: string): Promise<Emoji[]> {
  try {
    const fetched = await getEmojis(0, 12, locale, {
      sort: 'popular',
      category,
      isIndexable: true,
    });
    return filterSfw(fetched).slice(0, 3);
  } catch {
    return [];
  }
}

export async function CategoryShowcase({
  categories,
  locale,
}: {
  categories: CategoryInput[];
  locale: string;
}) {
  const t = await getTranslations();

  const top = [...categories]
    .filter((c) => (c.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 8);

  const previews = await Promise.all(top.map((c) => fetchPreview(c.name, locale)));

  return (
    <section
      id="category-showcase"
      aria-labelledby="category-showcase-title"
      className="w-full max-w-[1400px] mx-auto px-2 mt-12 mb-2"
    >
      <div className="mb-4">
        <h2
          id="category-showcase-title"
          className={cn(
            'text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold tracking-tight gradient-text',
            outfit.className
          )}
        >
          {t('home.categoryShowcase.title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('home.categoryShowcase.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {top.map((cat, i) => {
          const preview = previews[i] ?? [];
          const fallback = CATEGORY_EMOJI[cat.name] ?? '✨';
          return (
            <Link
              key={cat.name}
              href={`/category/${cat.name}`}
              className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 via-muted/20 to-primary/10 flex items-center justify-center relative">
                {preview.length > 0 ? (
                  <div className="flex items-center gap-2 px-3">
                    {preview.slice(0, 3).map((e, idx) => (
                      <div
                        key={e.slug}
                        className={cn(
                          'relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-background/60',
                          idx === 1 && 'translate-y-1',
                          idx === 2 && '-translate-y-1'
                        )}
                      >
                        <Image
                          src={e.image_url}
                          alt={e.prompt}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-6xl" aria-hidden>{fallback}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold capitalize group-hover:text-primary transition-colors">
                  {cat.translated_name || cat.name.replace(/_/g, ' ')}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cat.count
                    ? t('home.categoryShowcase.countLabel', { count: cat.count })
                    : t('home.categoryShowcase.exploreLabel')}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
