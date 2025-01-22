import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";
import Link from "next/link";

export function Features() {
  const services = siteConfig.features;
  return (
    <Section
      id="features"
      title="Features"
      subtitle="Powerful features"
      className="max-w-screen-lg mx-auto container px-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(({ name, description, icon: Icon }, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden bg-card p-6 flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center gap-y-4 mb-4">
              <div className="bg-gradient-to-b from-primary to-primary/80 p-2 rounded-lg text-white">
                {Icon}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground">
                {name}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            <Link href="#" className="text-sm text-primary hover:underline">
              Learn more &gt;
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
