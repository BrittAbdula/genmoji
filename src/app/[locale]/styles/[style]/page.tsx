// app/[locale]/styles/[style]/page.tsx
import { Metadata } from 'next';
import { getEmojis } from '@/lib/api';
import { siteConfig } from '@/lib/config';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronRight, Home, Palette, Sparkles, ArrowLeft, Info, CheckCircle2, Lightbulb, Wand2, BookOpen, Shield } from 'lucide-react';
import Image from 'next/image';
import { UnifiedGenmojiGenerator } from '@/components/unified-genmoji-generator';
import StylePageClient from './client';
import { Suspense } from 'react';

export const runtime = 'edge';

// ------- 样式分类（保留你的数据，只要保证 id/name/description 等字段存在即可）-------
const styleCategories = [
  {
    id: 'genmoji',
    name: 'Genmoji',
    description: 'iOS Apple-style with clean, modern design - our recommended default',
    image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4ad1e218-eae7-4976-8496-b68cd6374f00/public',
    subStyles: [],
    seoTitle: 'iOS Apple Genmoji Style - Default High-Quality Custom Genmojis',
    seoDescription: 'Create iOS Apple-style genmojis with our default AI generator. Clean, modern design with rounded corners and soft gradients, perfect for all messaging platforms.',
    features: [
      'iOS Apple-style design aesthetic',
      'Clean and modern appearance',
      'Soft gradients and rounded corners',
      'Consistent with Apple design language',
      'Perfect for professional use',
      'High-quality vector graphics',
    ],
  },
  {
    id: 'sticker',
    name: 'Sticker',
    description: 'Fun and colorful sticker-style',
    image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public',
    subStyles: [],
    seoTitle: 'Sticker Style Genmojis - Fun & Colorful Custom Emojis',
    seoDescription: 'Create fun and colorful sticker-style genmojis. Perfect for casual conversations and social media posts.',
    features: [
      'Vibrant and colorful design',
      'Playful and fun aesthetic',
      'Great for casual conversations',
      'Eye-catching visual appeal',
    ],
  },
  {
    id: 'gemstickers',
    name: 'Gem Stickers',
    description: 'Premium gem-style stickers with multiple sub-styles',
    image: '/emojis/handdrawn.png',
    subStyles: [
      { id: 'pop-art', name: 'Pop Art', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pop_art_love.png' },
      { id: 'japanese-matchbox', name: 'Japanese Matchbox', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/matchbox_no_text.png' },
      { id: 'cartoon-dino', name: 'Cartoon Dino', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/dragon.png' },
      { id: 'pixel-art', name: 'Pixel Art', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pixel.png' },
      { id: 'royal', name: 'Royal', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/royal.png' },
      { id: 'football-sticker', name: 'Football Sticker', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/football.png' },
      { id: 'claymation', name: 'Claymation', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/claymation.png' },
      { id: 'vintage-bollywood', name: 'Vintage Bollywood', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/bolly.png' },
      { id: 'sticker-bomb', name: 'Sticker Bomb', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/bomb.png' },
    ],
    seoTitle: 'Gem Stickers Style - Premium Multi-Style Custom Genmojis',
    seoDescription: 'Create premium gem-style genmojis with 9 unique sub-styles including pop art, pixel art, claymation, and more.',
    features: [
      '9 unique sub-styles available',
      'Premium gem-quality design',
      'Pop art, pixel art, claymation styles',
      'Royal and vintage aesthetics',
    ],
  },
  {
    id: 'pixel',
    name: 'Pixel',
    description: 'Retro pixel art style',
    image: '/emojis/pixel.png',
    subStyles: [],
    seoTitle: 'Pixel Art Style Genmojis - Retro 8-bit Custom Emojis',
    seoDescription: 'Create retro pixel art style genmojis with classic 8-bit aesthetics. Perfect for gaming and nostalgic vibes.',
    features: [
      'Classic 8-bit pixel art style',
      'Retro gaming aesthetic',
      'Nostalgic and charming design',
      'Perfect for gaming communities',
    ],
  },
  {
    id: 'handdrawn',
    name: 'Hand-drawn',
    description: 'Artistic hand-drawn style',
    image: '/emojis/handdrawn.png',
    subStyles: [],
    seoTitle: 'Hand-drawn Style Genmojis - Artistic Custom Emojis',
    seoDescription: 'Create artistic hand-drawn style genmojis with unique, personal touch. Perfect for creative and artistic expressions.',
    features: [
      'Artistic hand-drawn aesthetic',
      'Unique and personal touch',
      'Creative and expressive design',
      'Perfect for artistic communities',
    ],
  },
  {
    id: '3d',
    name: '3D',
    description: 'Three-dimensional with depth and volume',
    image: '/emojis/3d.png',
    subStyles: [],
    seoTitle: '3D Style Genmojis - Three-dimensional Custom Emojis',
    seoDescription: 'Create stunning 3D genmojis with depth and volume. Modern, realistic design perfect for professional presentations.',
    features: [
      'Three-dimensional depth and volume',
      'Modern and realistic design',
      'Professional appearance',
      'Perfect for presentations',
    ],
  },
  {
    id: 'claymation',
    name: 'Claymation',
    description: 'Clay animation style',
    image: '/emojis/Claymation.png',
    subStyles: [],
    seoTitle: 'Claymation Style Genmojis - Clay Animation Custom Emojis',
    seoDescription: 'Create charming claymation style genmojis with clay animation aesthetics. Perfect for creative and playful expressions.',
    features: [
      'Clay animation aesthetic',
      'Charming and playful design',
      'Unique texture and feel',
      'Perfect for creative projects',
    ],
  },
  {
    id: 'origami',
    name: 'Origami',
    description: 'Paper folding art style',
    image: '/emojis/Origami.png',
    subStyles: [],
    seoTitle: 'Origami Style Genmojis - Paper Folding Art Custom Emojis',
    seoDescription: 'Create beautiful origami style genmojis with paper folding art aesthetics. Elegant and minimalist design.',
    features: [
      'Paper folding art aesthetic',
      'Elegant and minimalist design',
      'Clean geometric patterns',
      'Perfect for zen and calm vibes',
    ],
  },
  {
    id: 'cross-stitch',
    name: 'Cross-stitch',
    description: 'Embroidery cross-stitch style',
    image: '/emojis/Cross-stitch-Pixel.png',
    subStyles: [],
    seoTitle: 'Cross-stitch Style Genmojis - Embroidery Custom Emojis',
    seoDescription: 'Create charming cross-stitch style genmojis with embroidery aesthetics. Handcrafted and cozy design.',
    features: [
      'Embroidery cross-stitch aesthetic',
      'Handcrafted and cozy design',
      'Textured and detailed appearance',
      'Perfect for craft communities',
    ],
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    description: 'Victorian steampunk style',
    image: '/emojis/Steampunk.png',
    subStyles: [],
    seoTitle: 'Steampunk Style Genmojis - Victorian Industrial Custom Emojis',
    seoDescription: 'Create unique steampunk style genmojis with Victorian industrial aesthetics. Perfect for fantasy and sci-fi themes.',
    features: [
      'Victorian industrial aesthetic',
      'Fantasy and sci-fi themes',
      'Unique mechanical details',
      'Perfect for steampunk communities',
    ],
  },
  {
    id: 'liquid-metal',
    name: 'Liquid Metal',
    description: 'Metallic liquid style',
    image: '/emojis/Liquid-Metal.png',
    subStyles: [],
    seoTitle: 'Liquid Metal Style Genmojis - Metallic Custom Emojis',
    seoDescription: 'Create stunning liquid metal style genmojis with metallic liquid aesthetics. Futuristic and sleek design.',
    features: [
      'Metallic liquid aesthetic',
      'Futuristic and sleek design',
      'Shiny and reflective appearance',
      'Perfect for tech and sci-fi themes',
    ],
  },
] as const;

type Props = {
  params: Promise<{ style: string }>;
};

// ---------------- Metadata（增强） ----------------
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { style } = await props.params;
  const locale = await getLocale();
  const category = styleCategories.find((cat) => cat.id === style);

  if (!category) {
    return {
      title: 'Style Not Found | Genmoji Online',
      description: 'The requested genmoji style could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.seoTitle} | ${siteConfig.name}`;
  const description = category.seoDescription;

  return {
    title,
    description,
    metadataBase: new URL(siteConfig.url),
    robots: { index: true, follow: true },
    // 适度加入“keywords”以覆盖长尾（部分搜索引擎仍参考）
    keywords: [
      `${category.name} emoji`,
      `${category.name} style genmoji`,
      'AI emoji generator',
      'custom emoji maker',
      'genmoji online',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: locale === 'en' ? `${siteConfig.url}/styles/${style}` : `${siteConfig.url}/${locale}/styles/${style}`,
      images: [
        {
          url: category.image,
          width: 1200,
          height: 630,
          alt: `${category.name} style genmojis preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [category.image],
    },
    alternates: {
      canonical:
        locale === 'en'
          ? `${siteConfig.url}/styles/${style}`
          : `${siteConfig.url}/${locale}/styles/${style}`,
      languages: {
        'x-default': `${siteConfig.url}/styles/${style}`,
        en: `${siteConfig.url}/styles/${style}`,
        'en-US': `${siteConfig.url}/styles/${style}`,
        ja: `${siteConfig.url}/ja/styles/${style}`,
        'ja-JP': `${siteConfig.url}/ja/styles/${style}`,
        fr: `${siteConfig.url}/fr/styles/${style}`,
        'fr-FR': `${siteConfig.url}/fr/styles/${style}`,
        zh: `${siteConfig.url}/zh/styles/${style}`,
        'zh-CN': `${siteConfig.url}/zh/styles/${style}`,
      },
    },
  };
}

// ---------------- 页面主体（SEO文案 + 结构化模块） ----------------
export default async function StylePage(props: Props) {
  const { style } = await props.params;
  const locale = await getLocale();
  const t = await getTranslations();
  const category = styleCategories.find((cat) => cat.id === style);

  if (!category) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Style Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested genmoji style could not be found.
          </p>
          <Link
            href={`/${locale}/styles`}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Styles
          </Link>
        </div>
      </div>
    );
  }

  // 拉取最近作品
  const initialEmojis = await getEmojis(0, 24, locale, { model: style, sort: 'latest' });

  // 生成 Prompt 模板（基于 name）
  const promptIdeas: string[] = [
    `A ${category.name.toLowerCase()} style emoji of a smiling face with sparkling eyes, high contrast, clean lighting`,
    `${category.name} style: cute animal mascot holding a coffee cup, soft gradient, minimal background`,
    `${category.name} style badge of a golden trophy, centered composition, high detail`,
    `${category.name} style weather icon set: sun, cloud, rain, snow, consistent color palette`,
    `${category.name} style reaction pack: LOL, OMG, WOW, subtle shadows, crisp edges`,
    `streamer pack in ${category.name} style: subscribe, like, follow, neon accents`,
    `${category.name} style esport avatar, bold outline, expressive eyes`,
    `festival sticker in ${category.name} style: fireworks, confetti, vivid hues`,
    `${category.name} style 3-icon set for productivity: focus, break, done`,
    `food emoji in ${category.name} style: ramen bowl, glossy highlights`,
    `${category.name} style travel pin: Tokyo landmark, clean geometry`,
    `${category.name} style mood set: happy / calm / excited, cohesive set`,
  ];

  // 用例卡片
  const useCases = [
    { title: 'Social & Chat', desc: 'Upgrade your DMs and group chats with expressive, on-brand reactions.' },
    { title: 'Streaming & Creator', desc: 'Channel badges, subscriber perks, and panel icons that pop on screen.' },
    { title: 'Community & Discord', desc: 'Role icons, event stickers, and custom reactions for servers.' },
    { title: 'Marketing & Branding', desc: 'Promo banners, campaign stickers, and unique brand mascots.' },
    { title: 'Gaming', desc: 'HUD icons, collectible stickers, and profile avatars for guilds and teams.' },
    { title: 'Education', desc: 'Reward badges, lesson markers, and friendly tutorial helpers.' },
  ];

  // 相关样式（内链）
  const related = styleCategories.filter((s) => s.id !== style).slice(0, 8);

  // FAQ（基于 name 动态生成）
  const faqs = [
    {
      q: `What is the ${category.name} style?`,
      a: `${category.name} focuses on ${category.description.toLowerCase()}. It’s ideal for quick reactions, messaging, and social sharing.`,
    },
    {
      q: `How do I create ${category.name} style genmojis?`,
      a: `Use the generator below: describe your idea in a short prompt, or upload a reference image. You’ll get multiple ${category.name.toLowerCase()} variants to choose from.`,
    },
    {
      q: `Can I use ${category.name} genmojis commercially?`,
      a: `You can download and use your outputs. For brand or large-scale commercial usage, review our Terms and check any third-party assets you include.`,
    },
    {
      q: `Do you support transparent backgrounds and high-res export?`,
      a: `Yes. Export with transparent PNG and high resolution for social, stream overlays, or print-ready assets.`,
    },
    {
      q: `What prompts work best for ${category.name}?`,
      a: `Keep prompts concise. Specify subject, mood, color vibe, and finish (e.g., “glossy”, “matte”, “pixelated”) for consistent results.`,
    },
    {
      q: `How is ${category.name} different from other styles?`,
      a: `${category.name} emphasizes the unique look mentioned above. Compare below to see when to pick alternatives like 3D, Hand-drawn, or Pixel.`,
    },
  ];

  // 结构化数据（JSON-LD）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${category.name} Style Genmojis`,
        url: `${siteConfig.url}/styles/${category.id}`,
        description: category.seoDescription,
        inLanguage: locale,
        isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteConfig.url}` },
          { '@type': 'ListItem', position: 2, name: 'Styles', item: `${siteConfig.url}/styles` },
          { '@type': 'ListItem', position: 3, name: category.name, item: `${siteConfig.url}/styles/${category.id}` },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: `${category.name} Style Genmoji Generator`,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        url: `${siteConfig.url}/styles/${category.id}`,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 面包屑 */}
      <nav className="py-4 container mx-auto px-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
          <li>
            <Link href={`/${locale}`} className="flex items-center hover:text-primary transition-colors">
              <Home className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href={`/${locale}/styles`} className="hover:text-primary transition-colors">
              {t('common.navigation.styles')}
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-foreground">{category.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header / Hero（SEO首屏） */}
      <header className="relative overflow-hidden bg-muted/5 py-8">
        <div className="container mx-auto px-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">{category.name} Style — AI Emoji & Genmoji Generator</h1>
            <UnifiedGenmojiGenerator init_model={style as any} />
          </div>
        </div>
      </header>

      {/* 生成器 */}
      <section className="container mx-auto px-4 py-14" aria-labelledby="generator-title">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 id="generator-title" className="text-2xl font-bold mb-3">
              Create {category.name} Style Genmojis
            </h2>
            <p className="text-muted-foreground">
              Type a short prompt or upload an image. Our model will generate multiple {category.name.toLowerCase()} options in seconds.
            </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {category.seoDescription}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.features.slice(0, 4).map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">{f}</span>
                ))}
              </div>
          </div>
        </div>
      </section>

      {/* 优势与对比 */}
      <section className="bg-muted/5 py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" /> Why choose {category.name}?
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 mt-0.5 text-primary" /> Consistent look for packs and sticker sets.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 mt-0.5 text-primary" /> Works great for chats, streams, and community badges.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 mt-0.5 text-primary" /> High-res export with transparent background.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-5 w-5 mt-0.5 text-primary" /> Quick iteration: adjust prompt → regenerate variations.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">When to pick alternatives</h3>
              <p className="text-muted-foreground mb-3">
                Choose 3D for realistic depth, Hand-drawn for artistic lines, or Pixel for retro 8-bit charm. {category.name} is the sweet spot for clarity and impact.
              </p>
              <div className="flex flex-wrap gap-2">
                {['3d','handdrawn','pixel'].filter(id => id !== style).map(id => {
                  const rel = styleCategories.find(c => c.id === id)!;
                  return (
                    <Link
                      key={id}
                      href={`/${locale}/styles/${id}`}
                      className="inline-flex items-center px-3 py-1 rounded-full border hover:bg-primary/10"
                      aria-label={`Explore ${rel.name} style`}
                    >
                      <Palette className="h-4 w-4 mr-1" /> {rel.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

{/* 最近作品（你已有的 Suspense 客户端渲染保持不变） */}
<section className="container mx-auto px-4 py-14" aria-labelledby="recent">
  <div className="max-w-6xl mx-auto">
    <h2 id="recent" className="text-2xl font-bold mb-4">Recent {category.name} creations</h2>
    <p className="text-muted-foreground mb-6">Fresh results from our community using the {category.name.toLowerCase()} style.</p>
    <Suspense
      fallback={
        <div className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      }
    >
      <StylePageClient params={{ style, locale }} initialData={{ emojis: initialEmojis }} />
    </Suspense>
  </div>
</section>

      {/* 三步创建 */}
      <section className="container mx-auto px-4 py-14" aria-labelledby="steps">
        <div className="max-w-5xl mx-auto">
          <h2 id="steps" className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Wand2 className="h-5 w-5" /> How to make {category.name} genmojis (3 steps)
          </h2>
          <ol className="grid md:grid-cols-3 gap-6">
            <li className="rounded-lg border p-5">
              <span className="text-sm font-semibold">1. Describe</span>
              <p className="text-muted-foreground">Write a short prompt: subject + mood + color vibe + finish (e.g., glossy, matte).</p>
            </li>
            <li className="rounded-lg border p-5">
              <span className="text-sm font-semibold">2. Generate</span>
              <p className="text-muted-foreground">Create multiple options instantly. Tweak wording to match the exact {category.name.toLowerCase()} look.</p>
            </li>
            <li className="rounded-lg border p-5">
              <span className="text-sm font-semibold">3. Export</span>
              <p className="text-muted-foreground">Download transparent PNG or high-res files ready for social, stream overlays, or print.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* 用例 */}
      <section className="bg-muted/5 py-14" aria-labelledby="use-cases">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 id="use-cases" className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Popular use cases for {category.name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-lg border bg-background p-5">
                <h3 className="font-semibold mb-2">{u.title}</h3>
                <p className="text-muted-foreground">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 子样式 */}
      {category.subStyles.length > 0 && (
        <section className="container mx-auto px-4 py-14" aria-labelledby="substyles">
          <div className="max-w-6xl mx-auto">
            <h2 id="substyles" className="text-2xl font-bold mb-6">{category.name} sub-styles</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.subStyles.map((sub) => (
                <div key={sub.id} className="bg-background rounded-lg border p-4 text-center hover:border-primary/30 transition-colors">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary/10 to-primary/30 rounded-lg flex items-center justify-center">
                    <Image
                      src={sub.image}
                      alt={`${category.name} — ${sub.name} preview`}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <h3 className="text-sm font-medium">{sub.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 提示词模板 */}
      <section className="container mx-auto px-4 py-14" aria-labelledby="prompts">
        <div className="max-w-5xl mx-auto">
          <h2 id="prompts" className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" /> Prompt ideas for {category.name}
          </h2>
          <ul className="grid md:grid-cols-2 gap-3 text-muted-foreground">
            {promptIdeas.map((p, i) => (
              <li key={i} className="rounded-md border p-3">{p}</li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Tip: keep it short; specify subject, mood, colors, and finish.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/5 py-14" aria-labelledby="faq">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 id="faq" className="text-2xl font-bold mb-6">FAQ — {category.name} style</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-lg border bg-background p-4">
                <summary className="font-medium cursor-pointer">{f.q}</summary>
                <p className="text-muted-foreground mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 相关样式 */}
      <section className="container mx-auto px-4 py-14" aria-labelledby="related">
        <div className="max-w-6xl mx-auto">
          <h2 id="related" className="text-2xl font-bold mb-6">Related styles</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/${locale}/styles/${r.id}`}
                className="rounded-lg border p-4 hover:border-primary/40 transition-colors flex items-center gap-3"
                aria-label={`Open ${r.name} style`}
              >
                <Image
                  src={r.image}
                  alt={`${r.name} style card`}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                />
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{r.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to create more {category.name}?</h2>
            <p className="text-muted-foreground mb-6">
              Explore other styles or jump back to the generator to craft a cohesive pack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/styles`}
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse all styles
              </Link>
              <Link
                href={`/${locale}/`}
                className="inline-flex items-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Create now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 简短品牌/信任信息（E-E-A-T） */}
      <footer className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> About Genmoji Online
            </h3>
            <p className="text-muted-foreground">
              Genmoji Online helps creators and communities design on-brand emojis and stickers with AI.
              Generate cohesive packs, export in high-res, and ship assets across chat, streams, and social.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Tips for best results
            </h3>
            <ul className="text-muted-foreground list-disc pl-5 space-y-1">
              <li>Keep prompts concise; specify mood and finishes (glossy, matte, pixelated).</li>
              <li>Stick to a consistent color palette for packs.</li>
              <li>Use transparent PNG for overlays and stream assets.</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
