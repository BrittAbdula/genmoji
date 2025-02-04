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
export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
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
