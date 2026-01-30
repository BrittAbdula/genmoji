import { Metadata } from 'next';
import { siteConfig } from "@/lib/config";
import { buildAlternates } from '@/lib/seo';
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
  
  const title = `Mascot Maker | ${siteConfig.name}`;
  const description = `Create distinctive, character-rich mascots with our AI-powered Mascot Maker. Perfect for brands, teams, projects, and content creators.`;
  
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
          alt: 'Mascot Maker'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: buildAlternates('/mascot-maker', locale),
  };
}

export default async function MascotMakerPage(props: Props) {
  const { locale } = await props.params;
  // 启用静态渲染
  setRequestLocale(locale);

  return (
    <main className="items-center container mx-auto p-2">
      {/* 1. H1 title, p slogan */}
      <section className="py-10 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Mascot Maker</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create distinctive character mascots with our AI-powered Mascot Maker that represent your brand or project
        </p>
      </section>
      
      {/* 2. Generator 模块 */}
      <section className="py-8 max-w-3xl mx-auto">
        <UnifiedGenmojiGenerator initialPrompt="" init_model="mascot" />
      </section>
      
      {/* 3. HorizontalGalleryContent 模块 */}
      <section className="py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Explore Mascot Maker Gallery</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of Mascot Maker creations for inspiration and see what others have designed
          </p>
        </div>
        <HorizontalGalleryContent model="mascot" />
      </section>
      
      {/* 4. Model Feature */}
      <section className="py-16 bg-muted/30 rounded-xl">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-4">Mascot Maker Features</h2>
          <p className="text-lg text-muted-foreground">
            Our Mascot Maker is designed to create distinctive, memorable, and full of personality mascots. They help establish brand identity and create an emotional connection with your audience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Distinctive Mascots</h3>
            <p className="text-muted-foreground">The Mascot Maker helps you stand out with unique character designs that represent your brand values</p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">🎭</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Memorable Mascots</h3>
            <p className="text-muted-foreground">Create mascots with our Mascot Maker that stick in people's minds and build recognition</p>
          </div>
          
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <span className="text-primary text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Versatile Mascots</h3>
            <p className="text-muted-foreground">Use mascots from our Mascot Maker across all your branding materials and platforms</p>
          </div>
        </div>
      </section>
      
      {/* 5. How to Use */}
      <section className="py-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-4">How to Use the Mascot Maker</h2>
          <p className="text-lg text-muted-foreground">
            Follow these simple steps to create your own custom mascot with our Mascot Maker in seconds
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Describe Your Mascot</h3>
            <p className="text-muted-foreground">Enter a detailed description in the Mascot Maker of the character you want to create</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Optional: Add Reference</h3>
            <p className="text-muted-foreground">Upload a reference image to guide the Mascot Maker AI generation (optional)</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
            <p className="text-muted-foreground">Click generate and download your custom mascot from the Mascot Maker to use anywhere</p>
          </div>
        </div>
      </section>
      
    </main>
  );
} 
