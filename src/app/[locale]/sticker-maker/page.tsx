import { Metadata } from 'next';
import { siteConfig } from "@/lib/config";
import { getLocale, setRequestLocale } from 'next-intl/server';
import { UnifiedGenmojiGenerator } from '@/components/unified-genmoji-generator';
import { HorizontalGalleryContent } from '@/components/horizontal-gallery-content';
import { CTA } from '@/components/sections/cta';

export const runtime = 'edge';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  
  const title = `Sticker Maker | ${siteConfig.name}`;
  const description = `Create vibrant, eye-catching stickers with our AI-powered Sticker Maker. Perfect for messaging apps, social media, and creative projects.`;
  
  return {
    title,
    description,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Sticker Maker'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: locale === 'en' ? `${siteConfig.url}/sticker-maker` : `${siteConfig.url}/${locale}/sticker-maker`,
      languages: {
        'x-default': `${siteConfig.url}/sticker-maker`,
        'en': `${siteConfig.url}/sticker-maker`,
        'en-US': `${siteConfig.url}/sticker-maker`,
        'ja': `${siteConfig.url}/ja/sticker-maker`,
        'ja-JP': `${siteConfig.url}/ja/sticker-maker`,
        'fr': `${siteConfig.url}/fr/sticker-maker`,
        'fr-FR': `${siteConfig.url}/fr/sticker-maker`,
        'zh': `${siteConfig.url}/zh/sticker-maker`,
        'zh-CN': `${siteConfig.url}/zh/sticker-maker`,
      },
    },
  };
}

export default async function StickerMakerPage(props: Props) {
  const { locale } = await props.params;
  // 启用静态渲染
  setRequestLocale(locale);

  return (
    <main className="items-center container mx-auto p-2">
      {/* 1. H1 title, p slogan */}
      <section className="py-10 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Sticker Maker</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create vibrant, eye-catching stickers with our AI-powered Sticker Maker that make your messages pop
        </p>
      </section>
      
      {/* 2. Generator 模块 */}
      <section className="py-8 max-w-3xl mx-auto">
        <UnifiedGenmojiGenerator mode="inline" initialPrompt="" init_model="sticker" />
      </section>
      
      {/* 3. HorizontalGalleryContent 模块 */}
      <section className="py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Explore Sticker Maker Gallery</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of Sticker Maker creations for inspiration and see what others have created
          </p>
        </div>
        <HorizontalGalleryContent model="sticker" />
      </section>
      
      {/* 4. Model Feature */}
      <section className="py-16 bg-muted/30 rounded-xl">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-4">Sticker Maker Features</h2>
          <p className="text-lg text-muted-foreground">
            Our Sticker Maker is designed to help you create stickers that stand out with bold outlines, vibrant colors, and eye-catching designs that make your messages more expressive and fun.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">🌈</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Vibrant Stickers</h3>
            <p className="text-muted-foreground">The Sticker Maker creates bold colors and striking designs that instantly grab attention</p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Expressive Stickers</h3>
            <p className="text-muted-foreground">Convey complex emotions and ideas with a single sticker from our Sticker Maker</p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Compatible Stickers</h3>
            <p className="text-muted-foreground">Stickers from our Sticker Maker work with all major messaging platforms and social media apps</p>
          </div>
        </div>
      </section>
      
      {/* 5. How to Use */}
      <section className="py-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-4">How to Use the Sticker Maker</h2>
          <p className="text-lg text-muted-foreground">
            Follow these simple steps to create your own custom stickers with our Sticker Maker in seconds
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Describe Your Sticker</h3>
            <p className="text-muted-foreground">Enter a detailed description in the Sticker Maker of what you want to create</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Optional: Add Reference</h3>
            <p className="text-muted-foreground">Upload a reference image to guide the Sticker Maker AI generation (optional)</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
            <p className="text-muted-foreground">Click generate and download your custom sticker from the Sticker Maker to use anywhere</p>
          </div>
        </div>
      </section>
      
    </main>
  );
} 