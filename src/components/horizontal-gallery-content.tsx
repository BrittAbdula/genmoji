"use client";

import { Link } from '@/i18n/routing';
import { useState, useEffect, Suspense, useRef } from "react";
import { getEmojis } from '@/lib/api'
import EmojiContainer from "@/components/emoji-container";
import { Emoji } from "@/types/emoji";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { outfit } from "@/lib/fonts";
import Image from "next/image";

export function HorizontalGalleryContent({model, initialEmojis}: {model?: string, initialEmojis?: Emoji[]}) {
  const t = useTranslations();
  const router = useRouter();
  const [emojis, setEmojis] = useState<Emoji[]>(initialEmojis ?? []);
  const [loading, setLoading] = useState<boolean>(!(initialEmojis && initialEmojis.length > 0));
  const [error, setError] = useState<string | null>(null);
  const limit = 36; // Reduce initial grid for better performance
  const locale = useLocale();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const didMountRef = useRef(false);

  // Model chips (only show on homepage when no explicit model is passed)
  const modelItems = [
    { id: 'genmoji', name: t('generator.models.genmoji.name'), image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4ad1e218-eae7-4976-8496-b68cd6374f00/public" },
    { id: 'sticker', name: t('generator.models.sticker.name'), image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public" },
    { id: 'liquid-metal', name: t('generator.models.liquid-metal.name'), image: "/emojis/Liquid-Metal.png" },
    { id: 'claymation', name: t('generator.models.claymation.name'), image: "/emojis/Claymation.png" },
    { id: '3d', name: t('generator.models.3d.name'), image: "/emojis/3d.png" },
    { id: 'handdrawn', name: t('generator.models.handdrawn.name'), image: "/emojis/handdrawn.png" },
    { id: 'origami', name: t('generator.models.origami.name'), image: "/emojis/Origami.png" },
    { id: 'pixel', name: t('generator.models.pixel.name'), image: "/emojis/pixel.png" },
    { id: 'cross-stitch', name: t('generator.models.cross-stitch.name'), image: "/emojis/Cross-stitch-Pixel.png" },
    { id: 'steampunk', name: t('generator.models.steampunk.name'), image: "/emojis/Steampunk.png" },
    { id: 'doodle', name: t('generator.models.doodle.name'), image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/671e0a40-ff72-4531-069f-6c86cb801200/public" },
    { id: 'chibi', name: t('generator.models.chibi.name'), image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/40baee31-30d2-4890-e853-e9fbd07ab000/public" },
    { id: 'plushie', name: t('generator.models.plushie.name'), image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/c084cf24-fc12-4f80-1b7c-76cab6b2da00/public" },
    { id: 'gemstickers', name: t('generator.models.gemstickers.name'), image: "https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pixel_out.png" },
  ];

  const fetchEmojis = async (retryCount = 2) => { // Reduced retries from 3 to 2
    try {
      setError(null);
      const effectiveModel = selectedModel ?? model ?? undefined;
      const newEmojis = await getEmojis(0, limit, locale, effectiveModel ? {
        sort: 'latest',
        model: effectiveModel,
        isIndexable: true,
      } : { sort: 'latest', isIndexable: true });
      setEmojis(newEmojis || []);
    } catch (error) {
      console.error('Error fetching emojis:', error);
      if (retryCount > 0) {
        const delay = 1000 * (3 - retryCount); // Shorter delays
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchEmojis(retryCount - 1);
      }
      setError(t('generator.error.failed'));
      setEmojis([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取数据：初始 + 每次风格/prop切换
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      // 如果有首屏SSR数据且未固定模型，则跳过首次拉取
      if (initialEmojis && initialEmojis.length > 0 && !model) {
        return;
      }
    }
    setLoading(true);
    fetchEmojis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, model, locale]);

  // 调整单元格样式确保完全正方形
  const cellWidth = "w-full min-h-[90px] aspect-square";
  // 紧凑网格：轻微间距（gap-1）、方形单元格
  // 紧凑网格：轻微间距（gap-1）、方形单元格
  const gridClass = "grid w-full auto-rows-max grid-cols-2 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-w-7xl mx-auto";

  const renderContent = () => {
    if (loading) {
      return (
        <div className={gridClass}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={`loading-skeleton-${i}`} className={`${cellWidth} bg-muted/20 animate-pulse`} />
          ))}
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className={gridClass}>
            {[...Array(limit)].map((_, i) => (
              <div key={i} className={`${cellWidth} bg-muted/20 animate-pulse`} />
            ))}
          </div>
        }>
        <div className={gridClass}>
            {emojis.map((emoji, index) => (
               <div key={`${emoji.slug}-${index}`} className="group relative flex flex-col overflow-hidden rounded-none border bg-card transition-shadow hover:shadow-md">
                 <div className="aspect-square w-full">
                    <EmojiContainer 
                      emoji={emoji} 
                      size="sm" 
                      lazyLoad={index > 8} 
                      padding="p-0" 
                      withBorder={false}
                      priority={index <= 8}
                    />
                 </div>
                 <Link 
                    href={`/emoji/${emoji.slug}`}
                    className="flex flex-1 px-3 py-3 text-xs text-muted-foreground hover:text-primary transition-colors text-left"
                 >
                    {emoji.prompt}
                 </Link>
               </div>
            ))}
          </div>
        </Suspense>
      </div>
    );
  };

  return (
    <div id="horizontal-gallery" className="w-full max-w-[1400px] mx-auto px-2 space-y-4">
      <h2 className={cn(
    "text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold tracking-tight gradient-text",
    outfit.className
  )}>
          {t('generator.recentTitle')}
      </h2>
      {/* Style filter chips (only show when no fixed model) */}
      {!model && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pr-4 touch-pan-x scrollbar-hide" role="listbox" aria-label={t('common.navigation.models')}>
          <button
            type="button"
            onClick={() => setSelectedModel(null)}
            aria-pressed={selectedModel === null}
            className={cn(
              "px-3 py-2 rounded-full border text-xs shrink-0",
              selectedModel === null ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/60"
            )}
          >
            {t('common.navigation.allModels')}
          </button>
          {modelItems.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedModel(m.id)}
              aria-pressed={selectedModel === m.id}
              className={cn(
                "flex items-center gap-2 shrink-0 border rounded-full pr-3 pl-2 py-2",
                selectedModel === m.id ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/60"
              )}
              title={m.name}
            >
              <Image src={m.image} alt={m.name} width={24} height={24} className="rounded-full" />
              <span className="text-[13px] whitespace-nowrap">{m.name}</span>
            </button>
          ))}
        </div>
      )}
      {renderContent()}
      <div className="flex justify-center pt-2">
        <Button
          onClick={() => model ? router.push(`/${locale}/model/${model}/`) : router.push('/gallery')}
          variant="outline"
          className="rounded-full px-6 hover:bg-background/80 flex items-center gap-2"
        >
          {t('common.navigation.gallery')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 
