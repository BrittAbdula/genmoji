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
  
  const title = `Genmoji Maker | ${siteConfig.name}`;
  const description = `Create your own custom Genmoji style emojis with our AI-powered emoji generator. Express yourself with unique, cute and expressive emojis.`;
  
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
          alt: 'Genmoji Maker'
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
      canonical: locale === 'en' ? `${siteConfig.url}/genmoji-maker` : `${siteConfig.url}/${locale}/genmoji-maker`,
      languages: {
        'x-default': `${siteConfig.url}/genmoji-maker`,
        'en': `${siteConfig.url}/genmoji-maker`,
        'en-US': `${siteConfig.url}/genmoji-maker`,
        'ja': `${siteConfig.url}/ja/genmoji-maker`,
        'ja-JP': `${siteConfig.url}/ja/genmoji-maker`,
        'fr': `${siteConfig.url}/fr/genmoji-maker`,
        'fr-FR': `${siteConfig.url}/fr/genmoji-maker`,
        'zh': `${siteConfig.url}/zh/genmoji-maker`,
        'zh-CN': `${siteConfig.url}/zh/genmoji-maker`,
      },
    },
  };
}

export default async function GenmojiMakerPage(props: Props) {
  const { locale } = await props.params;
  // 启用静态渲染
  setRequestLocale(locale);

  return (
    <main className="items-center container mx-auto p-2">
      {/* 1. H1 title, p slogan */}
      <section className="py-10 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Genmoji Maker</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create adorable, expressive emoji characters that perfectly capture your emotions
        </p>
      </section>
      
      {/* 2. Generator 模块 */}
      <section className="py-8 max-w-3xl mx-auto">
        <UnifiedGenmojiGenerator mode="inline" initialPrompt="" init_model="genmoji" />
      </section>
      
      {/* 3. HorizontalGalleryContent 模块 */}
      <section className="py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Explore Genmoji Gallery</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of Genmoji creations for inspiration
          </p>
        </div>
        <HorizontalGalleryContent model="genmoji" />
      </section>
      
      {/* 4. Model Feature */}
      <section className="py-16 bg-muted/30 rounded-xl">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-4">Genmoji Features</h2>
          <p className="text-lg text-muted-foreground">
            Genmojis are perfect for adding personality to your messages. Their cute, round design and expressive features make them instantly recognizable and lovable.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Expressive</h3>
            <p className="text-muted-foreground">Capture any emotion or reaction with our highly expressive emoji characters</p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Unique</h3>
            <p className="text-muted-foreground">Create one-of-a-kind emojis that stand out from standard emoji sets</p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">🔄</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Versatile</h3>
            <p className="text-muted-foreground">Use your Genmojis anywhere - messaging apps, social media, or personal projects</p>
          </div>
        </div>
      </section>
      
      {/* 5. How to Use */}
      <section className="py-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-4">How to Create Your Genmoji</h2>
          <p className="text-lg text-muted-foreground">
            Follow these simple steps to create your own custom Genmoji in seconds
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Describe Your Idea</h3>
            <p className="text-muted-foreground">Enter a detailed description of the emoji you want to create</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Optional: Add Reference</h3>
            <p className="text-muted-foreground">Upload a reference image to guide the AI generation (optional)</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
            <p className="text-muted-foreground">Click generate and download your custom Genmoji to use anywhere</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <CTA />
    </main>
  );
} 