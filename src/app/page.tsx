import { Benefits } from "@/components/sections/benefits";
import { BentoGrid } from "@/components/sections/bento";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { FeatureHighlight } from "@/components/sections/feature-highlight";
import { FeatureScroll } from "@/components/sections/feature-scroll";
import { Features } from "@/components/sections/features";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { Testimonials } from "@/components/sections/testimonials";
import { siteConfig } from "@/lib/config";
import { GenmojiGenerator } from '@/components/sections/genmoji-generator';

export const metadata: Metadata = {
  title: `Genmoji Online - Your Ultimate Genmoji Generator`,
  description: `Create personalized genmojis with Genmoji Online, the ultimate genmoji generator. Transform text and images into beautiful Apple-style genmojis. Start generating your custom genmojis today!`,
  openGraph: {
    title: `Genmoji Online - Create Custom Genmojis`,
    description: `Create personalized genmojis with Genmoji Online, the ultimate genmoji generator. Transform text and images into beautiful Apple-style genmojis.`,
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Genmoji Online - AI Genmoji Generator',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Genmoji Online - Create Custom Genmojis',
    description: 'Create personalized genmojis with AI. Transform text and images into beautiful Apple-style genmojis.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteConfig.url,
  },
  keywords: [
    'genmoji', 'emoji generator', 'custom emoji', 'AI emoji', 'personalized emoji',
    'emoji maker', 'genmoji creator', 'online emoji generator', 'emoji design'
  ],
};

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <GenmojiGenerator />
      {/* <FeatureScroll /> */}
      <FeatureHighlight />
      {/* <BentoGrid />
      <Benefits />
      <Features /> */}
      {/*  <Testimonials />
      <Pricing /> */}
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
