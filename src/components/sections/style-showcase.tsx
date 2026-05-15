import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { outfit } from '@/lib/fonts';
import Image from 'next/image';

type StyleItem = { id: string; image: string };

const STYLES: StyleItem[] = [
  { id: 'genmoji', image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4ad1e218-eae7-4976-8496-b68cd6374f00/public' },
  { id: 'sticker', image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public' },
  { id: '3d', image: '/emojis/3d.png' },
  { id: 'claymation', image: '/emojis/Claymation.png' },
  { id: 'pixel', image: '/emojis/pixel.png' },
  { id: 'handdrawn', image: '/emojis/handdrawn.png' },
  { id: 'origami', image: '/emojis/Origami.png' },
  { id: 'liquid-metal', image: '/emojis/Liquid-Metal.png' },
  { id: 'cross-stitch', image: '/emojis/Cross-stitch-Pixel.png' },
  { id: 'steampunk', image: '/emojis/Steampunk.png' },
  { id: 'doodle', image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/671e0a40-ff72-4531-069f-6c86cb801200/public' },
  { id: 'chibi', image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/40baee31-30d2-4890-e853-e9fbd07ab000/public' },
  { id: 'plushie', image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/c084cf24-fc12-4f80-1b7c-76cab6b2da00/public' },
  { id: 'flower-petals', image: '/emojis/flower-petals.png' },
];

export async function StyleShowcase() {
  const t = await getTranslations();
  return (
    <section
      id="style-showcase"
      aria-labelledby="style-showcase-title"
      className="w-full max-w-[1400px] mx-auto px-2 mt-10 mb-2"
    >
      <div className="mb-4">
        <h2
          id="style-showcase-title"
          className={cn(
            'text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold tracking-tight gradient-text',
            outfit.className
          )}
        >
          {t('home.styleShowcase.title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('home.styleShowcase.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {STYLES.map((s) => (
          <Link
            key={s.id}
            href={`/styles/${s.id}`}
            className="group flex flex-col items-center rounded-xl border border-border bg-card p-3 transition-all hover:shadow-md hover:border-primary/30"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted/30">
              <Image
                src={s.image}
                alt={t(`generator.models.${s.id}.name`)}
                fill
                sizes="(min-width:1024px) 12vw, (min-width:640px) 20vw, 30vw"
                className="object-contain p-2 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="mt-2 text-xs sm:text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
              {t(`generator.models.${s.id}.name`)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
