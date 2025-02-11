import { Section } from "@/components/section";
import { useTranslations } from 'next-intl';import {
  SmileIcon,
  Wand2Icon,
  SparklesIcon,
  PaletteIcon,
  Share2Icon,
  DownloadIcon,
} from "lucide-react";

export function Features() {
  const features = useTranslations('features');

  const featureKeys = ['createGenmojis', 'onlineMaker', 'crossPlatform'];
  const icons = {
    createGenmojis: <SmileIcon className="w-6 h-6" />,
    onlineMaker: <Wand2Icon className="w-6 h-6" />,
    crossPlatform: <Share2Icon className="w-6 h-6" />,
  };

  return (
    <Section
      id="features"
      title={features('title')}
      subtitle={features('subtitle')}
      className="max-w-screen-lg mx-auto container px-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureKeys.map((key) => (
          <div
            key={key}
            className="rounded-lg overflow-hidden bg-card p-6 flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center gap-y-4 mb-4">
              <div className="bg-gradient-to-b from-primary to-primary/80 p-2 rounded-lg text-white">
                {icons[key as keyof typeof icons]}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground">
                {features(`${key}.name`)}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {features(`${key}.description`)}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
