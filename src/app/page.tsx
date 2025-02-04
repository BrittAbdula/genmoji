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
  title: `Genmoji Online - Your Genmoji Generator`,
  description: `Create personalized genmojis with Genmoji Online, the ultimate genmoji generator. Start generating your custom genmojis today!`,
  openGraph: {
    title: `Genmoji Online - Your Genmoji Generator`,
    description: `Create personalized genmojis with Genmoji Online, the ultimate genmoji generator. Start generating your custom genmojis today!`,
  },
  alternates: {
    canonical: siteConfig.url,
  },
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
